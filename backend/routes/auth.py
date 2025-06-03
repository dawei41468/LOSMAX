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
        print(f"Registered user {user_data.email}, role: {result.get('role')}, language: {result.get('language')}")
        return {
            "access_token": result["access_token"],
            "refresh_token": result["refresh_token"],
            "token_type": result["token_type"],
            "user_id": result["id"],
            "name": result["name"],
            "language": result.get("language"), # Add language
            "role": result.get("role") # Add role
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
        token_data = await AuthService.authenticate_user( # This service method returns 'name'
            form_data.username,
            form_data.password
        )
        user_id_str = token_data["id"] # Changed from token_data["user_id"]
        user_name = token_data.get("name")
        user_language = token_data.get("language")
        user_role = token_data.get("role") # Get role from token_data

        print(f"User {user_id_str} logged in, name: {user_name}, language: {user_language}, role: {user_role}")
        return {
            "access_token": token_data["access_token"],
            "refresh_token": token_data["refresh_token"],
            "token_type": token_data["token_type"],
            "user_id": user_id_str, # Use the fetched id
            "name": user_name,
            "language": user_language,
            "role": user_role # Add role to the response
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
    from bson import ObjectId # Import ObjectId
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: str = payload.get("sub") # 'sub' should now be user_id string
        if not user_id_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token (missing sub)"
            )
        
        try:
            user_obj_id = ObjectId(user_id_str)
        except Exception:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token (sub not ObjectId format)")

        # Revoke all refresh tokens for this user
        from database import get_db
        db = await get_db()
        await db.users.update_one(
            {"_id": user_obj_id}, # Query by _id
            {"$set": {"refresh_tokens": []}}
        )
        
        # Notify other active WebSocket sessions for this user
        await broadcast_auth_update_to_user(user_id=user_id_str, is_authenticated=False)
        
        print(f"User {user_id_str} logged out, tokens revoked, and WebSocket sessions notified")
        return {"message": "Successfully logged out"}
    except jwt.ExpiredSignatureError:
        user_id_from_expired_token = None
        try:
            unverified_payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM], options={"verify_signature": True, "verify_exp": False})
            user_id_from_expired_token = unverified_payload.get("sub")
        except PyJWTError:
            pass

        if user_id_from_expired_token:
            try:
                user_obj_id_expired = ObjectId(user_id_from_expired_token)
                from database import get_db
                db = await get_db()
                await db.users.update_one(
                    {"_id": user_obj_id_expired}, # Query by _id
                    {"$set": {"refresh_tokens": []}}
                )
                await broadcast_auth_update_to_user(user_id=user_id_from_expired_token, is_authenticated=False)
                print(f"User {user_id_from_expired_token} (from expired token) logged out, tokens revoked, and WebSocket sessions notified")
            except Exception: # Catch ObjectId conversion error or DB error
                 print(f"Logout attempt with expired token for sub {user_id_from_expired_token}, but failed to process fully.")
        else:
            print("Logout attempt with expired token, could not identify user for WS notification or DB operations.")
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
        user_id_str = payload.get("sub") # This is now the string _id

        if not user_id_str:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid new access token payload")

        # Fetch user details to include name in response
        from database import get_db
        from bson import ObjectId # Import ObjectId
        db = await get_db()
        try:
            user_obj_id = ObjectId(user_id_str)
        except Exception:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user ID format in new token")
            
        user_doc = await db.users.find_one({"_id": user_obj_id}) # Query by _id
        user_name = user_doc.get("name") if user_doc else None
        user_language = user_doc.get("language", "en") if user_doc else "en"
        user_role = user_doc.get("role", "User") if user_doc else "User" # Get role, default to "User"
        
        print(f"Refreshed tokens for user {user_id_str}, name: {user_name}, language: {user_language}, role: {user_role}")
        
        response = {
            "access_token": new_access_token,
            "token_type": "bearer",
            "user_id": user_id_str, # This is the string _id
            "name": user_name,
            "language": user_language,
            "role": user_role # Add role to the response
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
        user_id_to_delete = current_user.id # Use current_user.id
        print(f"Attempting to delete account for user ID: {user_id_to_delete}")

        deleted = await AuthService.delete_user(user_id_to_delete) # Pass user_id
        
        if deleted:
            await broadcast_auth_update_to_user(user_id=user_id_to_delete, is_authenticated=False) # Pass user_id
            print(f"Successfully deleted account for user ID: {user_id_to_delete} and notified WebSocket sessions.")
            return
        else:
            print(f"Account deletion failed for user ID: {user_id_to_delete} (AuthService.delete_user returned False)")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Account deletion failed unexpectedly."
            )

    except HTTPException as e:
        print(f"HTTPException during account deletion for {current_user.id}: {e.detail}") # Log with current_user.id
        raise e
    except Exception as e:
        print(f"Unexpected error during account deletion for {current_user.id}: {str(e)}") # Log with current_user.id
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
        user_id = current_user.id # Use current_user.id
        new_name = request_data.name
        
        print(f"Attempting to update name for user ID: {user_id} to {new_name}")

        updated_user_info = await AuthService.update_user_name(user_id, new_name) # Pass user_id
        
        # AuthService.update_user_name now returns {"id": ..., "name": ..., "email": ...}
        print(f"Successfully updated name for user ID: {user_id} to {updated_user_info.get('name')}")
        return updated_user_info

    except HTTPException as e:
        print(f"HTTPException during name update for {current_user.id}: {e.detail}") # Log with current_user.id
        raise e
    except Exception as e:
        print(f"Unexpected error during name update for {current_user.id}: {str(e)}") # Log with current_user.id
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
        user_id = current_user.id # Use current_user.id
        
        print(f"Attempting to change password for user ID: {user_id}")

        success = await AuthService.change_password(
            user_id, # Pass user_id
            request_data.current_password,
            request_data.new_password
        )
        
        if success:
            await broadcast_auth_update_to_user(user_id=user_id, is_authenticated=False) # Pass user_id
            print(f"Successfully changed password for user ID: {user_id}. Other sessions notified.")
            return {"message": "Password changed successfully. Please log in again."}
        else:
            print(f"Password change failed for user ID: {user_id} (AuthService.change_password returned False)")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, # Or 400 if it's a known condition like "no change"
                detail="Password change failed unexpectedly."
            )

    except HTTPException as e:
        print(f"HTTPException during password change for {current_user.id}: {e.detail}") # Log with current_user.id
        raise e
    except Exception as e:
        print(f"Unexpected error during password change for {current_user.id}: {str(e)}") # Log with current_user.id
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while changing the password."
        )
