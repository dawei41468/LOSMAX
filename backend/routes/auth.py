from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel # Import BaseModel for request body model
import jwt
from jwt import PyJWTError
from config.settings import settings

from models.user import User, UserCreate, Token, UserInDB # Added UserInDB
from services.auth_service import AuthService, refresh_access_token, get_current_user # Added get_current_user
# Import the broadcast function from the websocket routes
from routes.websocket import broadcast_auth_update_to_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    try:
        result = await AuthService.register_user(user_data)
        print(f"Registered user {user_data.email}")  # Standardized log format
        return {
            "access_token": result["access_token"],
            "refresh_token": result["refresh_token"],
            "token_type": result["token_type"],
            "user_id": result["user_id"],
            "name": result["name"]  # Add name to the response
        }
    except ValueError as e:
        print(f"Register error - {str(e)} - email:{user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Register error - {str(e)} - email:{user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        token_data = await AuthService.authenticate_user(
            form_data.username,
            form_data.password
        )
        payload = jwt.decode(token_data["access_token"], settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        print(f"User {user_id} logged in")  # Standardized log
        return {
            "access_token": token_data["access_token"],
            "refresh_token": token_data["refresh_token"],
            "token_type": token_data["token_type"],
            "user_id": user_id
        }
    except ValueError as e:
        print(f"Login error - {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"})

@router.post("/logout")
async def logout(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated")
    
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
            
        # Revoke all refresh tokens for this user
        from database import get_db
        db = await get_db()
        await db.users.update_one(
            {"email": email},
            {"$set": {"refresh_tokens": []}}
        )
        
        # Notify other active WebSocket sessions for this user
        await broadcast_auth_update_to_user(user_id=email, is_authenticated=False)
        
        print(f"User {email} logged out, tokens revoked, and WebSocket sessions notified")  # Standardized log
        return {"message": "Successfully logged out"}
    except jwt.ExpiredSignatureError:
        # Even if token expired, we still want to log the logout attempt
        # Potentially also broadcast auth update here if email can be extracted
        email_from_expired_token = None
        try:
            # Attempt to decode without verifying expiry to get email for notification
            unverified_payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM], options={"verify_signature": True, "verify_exp": False})
            email_from_expired_token = unverified_payload.get("sub")
        except PyJWTError:
            pass # Could not get email from expired token

        if email_from_expired_token:
            # Revoke all refresh tokens for this user if not already done
            from database import get_db
            db = await get_db()
            await db.users.update_one(
                {"email": email_from_expired_token},
                {"$set": {"refresh_tokens": []}} # Ensure revocation even on expired token logout
            )
            await broadcast_auth_update_to_user(user_id=email_from_expired_token, is_authenticated=False)
            print(f"User {email_from_expired_token} (from expired token) logged out, tokens revoked, and WebSocket sessions notified")
        else:
            print("Logout attempt with expired token, could not identify user for WS notification.")
        return {"message": "Session expired, logged out"}
    except PyJWTError as e:
        print(f"Logout error - {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token")
    
@router.post("/refresh", response_model=Token)
async def refresh_token(request: Request):
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        
        refresh_token = auth_header.split(" ")[1]
        new_access_token, new_refresh_token = await refresh_access_token(refresh_token)
        
        # Decode to get user ID
        payload = jwt.decode(new_access_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        
        print(f"Refreshed tokens for user {user_id}")  # Standardized log
        
        response = {
            "access_token": new_access_token,
            "token_type": "bearer",
            "user_id": user_id
        }
        
        # Include new refresh token if rotation is enabled
        if settings.REFRESH_TOKEN_ROTATION:
            response["refresh_token"] = new_refresh_token
            
        return response
        
    except HTTPException as e:
        print(f"Refresh error - {str(e)}")
        raise
    except Exception as e:
        print(f"Refresh error - {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

@router.delete("/account", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(current_user: UserInDB = Depends(get_current_user)):
    """
    Delete the currently authenticated user's account.
    """
    try:
        user_email_to_delete = current_user.email
        print(f"Attempting to delete account for user: {user_email_to_delete}")

        deleted = await AuthService.delete_user(user_email_to_delete)
        
        if deleted:
            # Notify other active WebSocket sessions for this user that they are logged out/deleted
            await broadcast_auth_update_to_user(user_id=user_email_to_delete, is_authenticated=False)
            print(f"Successfully deleted account for user: {user_email_to_delete} and notified WebSocket sessions.")
            # No content is returned for 204, but FastAPI handles this.
            # If you wanted to return a JSON response, you'd change the status code.
            return
        else:
            # This case should ideally be handled within AuthService.delete_user by raising an exception
            # if deletion fails after user was confirmed to exist.
            print(f"Account deletion failed for user: {user_email_to_delete} (AuthService.delete_user returned False)")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Account deletion failed unexpectedly."
            )

    except HTTPException as e:
        # Re-raise HTTPExceptions (e.g., user not found from delete_user)
        print(f"HTTPException during account deletion for {current_user.email}: {e.detail}")
        raise e
    except Exception as e:
        # Catch any other unexpected errors
        print(f"Unexpected error during account deletion for {current_user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while deleting the account."
        )

class UpdateNameRequest(BaseModel): # Corrected class definition
    name: str

@router.patch("/update-name", response_model=dict) # Using dict for simple response
async def update_name(
    request_data: UpdateNameRequest, # Corrected indentation for parameters
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Update the display name for the currently authenticated user.
    """
    try:
        user_email = current_user.email
        new_name = request_data.name
        
        print(f"Attempting to update name for user: {user_email} to {new_name}")

        updated_user_info = await AuthService.update_user_name(user_email, new_name)
        
        print(f"Successfully updated name for user: {user_email} to {updated_user_info.get('name')}")
        return updated_user_info # Returns {"email": ..., "name": ...}

    except HTTPException as e:
        # Re-raise HTTPExceptions (e.g., user not found from service)
        print(f"HTTPException during name update for {current_user.email}: {e.detail}")
        raise e
    except Exception as e:
        # Catch any other unexpected errors
        print(f"Unexpected error during name update for {current_user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while updating the name."
        )

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.patch("/change-password", status_code=status.HTTP_200_OK)
async def change_password_route(
    request_data: ChangePasswordRequest,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Change the password for the currently authenticated user.
    """
    try:
        user_email = current_user.email
        
        print(f"Attempting to change password for user: {user_email}")

        success = await AuthService.change_password(
            user_email,
            request_data.current_password,
            request_data.new_password
        )
        
        if success:
            # Notify other active WebSocket sessions for this user that they should re-authenticate / tokens might be invalid
            # This is a stronger measure than just logout, as other sessions might still have old tokens.
            # For simplicity, we'll broadcast a generic auth update, which might prompt client to re-check auth or logout.
            await broadcast_auth_update_to_user(user_id=user_email, is_authenticated=False) # Treat as logout for other sessions
            print(f"Successfully changed password for user: {user_email}. Other sessions notified.")
            return {"message": "Password changed successfully. Please log in again."}
        else:
            # This case should ideally be handled within AuthService.change_password by raising an exception
            print(f"Password change failed for user: {user_email} (AuthService.change_password returned False)")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, # Or 400 if it's a known condition like "no change"
                detail="Password change failed unexpectedly."
            )

    except HTTPException as e:
        # Re-raise HTTPExceptions (e.g., user not found, incorrect current password)
        print(f"HTTPException during password change for {current_user.email}: {e.detail}")
        raise e
    except Exception as e:
        # Catch any other unexpected errors
        print(f"Unexpected error during password change for {current_user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while changing the password."
        )
