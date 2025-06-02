from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple

import jwt
from jwt import PyJWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

from config.settings import settings
from models.user import UserCreate, UserInDB, RefreshToken
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

class AuthService:
    async def verify_websocket_token(self, token: str) -> Optional[str]:
        """Verify WebSocket JWT token and return user_id if valid"""
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            user_id: str = payload.get("sub")
            if user_id is None:
                return None
            return user_id
        except PyJWTError:
            return None

    @staticmethod
    async def register_user(user_data: UserCreate) -> dict:
        from database import get_db
        db = await get_db()
        
        print(f"Attempting to register user with email: {user_data.email}")  # Debug log
        
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            print(f"Registration failed - email already exists: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        hashed_password = get_password_hash(user_data.password)
        db_user = UserInDB(
            email=user_data.email,
            name=user_data.name, # Save the name
            hashed_password=hashed_password
        )
        
        print(f"Creating user document: {db_user.dict(exclude_none=True)}")  # Debug log
        
        # Save to MongoDB
        try:
            result = await db.users.insert_one(db_user.dict())
            print(f"Insert result: {result.inserted_id}")  # Debug log
        except Exception as e:
            print(f"Failed to insert user: {str(e)}")  # Debug log
            raise
        
        access_token = create_access_token(
            data={"sub": user_data.email},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        refresh_token = create_refresh_token(
            data={"sub": user_data.email},
            expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )
        
        # Update user with refresh token
        await db.users.update_one(
            {"email": user_data.email},
            {"$push": {"refresh_tokens": {
                "token": refresh_token,
                "expires_at": datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
            }}}
        )
        
        # Removed websocket broadcast after simplifying implementation
        return {
            "email": db_user.email,
            "name": db_user.name, # Return the name
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_id": user_data.email # user_id is the email
        }

    @classmethod
    async def authenticate_user(cls, email: str, password: str) -> dict:
        from database import get_db
        db = await get_db()
        
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"Access-Control-Allow-Origin": "http://localhost:5173"}
            )
            
        if not verify_password(password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"Access-Control-Allow-Origin": "http://localhost:5173"}
            )
            
        access_token = create_access_token(
            data={"sub": email},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        refresh_token = create_refresh_token(
            data={"sub": email},
            expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )
        
        # Update user with new refresh token
        await db.users.update_one(
            {"email": email},
            {"$push": {"refresh_tokens": {
                "token": refresh_token,
                "expires_at": datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
            }}}
        )
        
        # Broadcast auth state to WebSocket clients
        # Removed websocket broadcast after simplifying implementation
        user_name = user.get("name") # Get name from DB
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_id": email,  # Using email as user ID
            "name": user_name # Return the name
        }

    @staticmethod
    async def update_user_name(user_email: str, new_name: str) -> dict:
        from database import get_db
        db = await get_db()

        print(f"Attempting to update name for user: {user_email} to {new_name}")

        user = await db.users.find_one({"email": user_email})
        if not user:
            print(f"Update name failed - user not found: {user_email}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        result = await db.users.update_one(
            {"email": user_email},
            {"$set": {"name": new_name}}
        )

        if result.modified_count == 1:
            print(f"Successfully updated name for user: {user_email}")
            # Return a dictionary that includes the updated name, similar to what frontend might expect
            return {"email": user_email, "name": new_name}
        elif result.matched_count == 1 and result.modified_count == 0:
            print(f"User {user_email} name is already {new_name}.")
            return {"email": user_email, "name": new_name} # Name was already the same
        else:
            # This case should ideally not be reached if find_one found the user
            print(f"Update name failed for user: {user_email}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user name"
            )

    @staticmethod
    async def change_password(user_email: str, current_password: str, new_password: str) -> bool:
        from database import get_db
        db = await get_db()

        print(f"Attempting to change password for user: {user_email}")

        user_doc = await db.users.find_one({"email": user_email})
        if not user_doc:
            print(f"Change password failed - user not found: {user_email}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if not verify_password(current_password, user_doc["hashed_password"]):
            print(f"Change password failed - incorrect current password for user: {user_email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password"
            )

        new_hashed_password = get_password_hash(new_password)
        
        # Update password and clear all existing refresh tokens for security
        result = await db.users.update_one(
            {"email": user_email},
            {"$set": {"hashed_password": new_hashed_password, "refresh_tokens": []}}
        )

        if result.modified_count == 1:
            print(f"Successfully changed password and cleared refresh tokens for user: {user_email}")
            return True
        else:
            # This might happen if the new password hash is the same as the old one,
            # or if the user was found but update failed for some reason.
            print(f"Change password failed (or no change made) for user: {user_email}")
            # Even if password wasn't "modified" (e.g. same new password), tokens should be cleared.
            # Check if tokens were cleared if that's a separate operation or rely on the $set.
            # For simplicity, we assume if matched_count is 1, it's okay.
            if result.matched_count == 1:
                 print(f"Password for user {user_email} was not changed (possibly same as old), but refresh tokens cleared.")
                 return True # Still consider it a success in terms of security action (tokens cleared)
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to change password"
            )

    @staticmethod
    async def delete_user(user_email: str) -> bool:
        from database import get_db
        db = await get_db()

        print(f"Attempting to delete user with email: {user_email}") # Debug log

        user_to_delete = await db.users.find_one({"email": user_email})
        if not user_to_delete:
            print(f"Deletion failed - user not found: {user_email}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        try:
            # Delete associated goals
            delete_goals_result = await db.goals.delete_many({"user_id": user_email})
            print(f"Deleted {delete_goals_result.deleted_count} goals for user: {user_email}")

            # Delete associated tasks
            # Assuming tasks are stored in a 'tasks' collection and have a 'user_id' field
            delete_tasks_result = await db.tasks.delete_many({"user_id": user_email})
            print(f"Deleted {delete_tasks_result.deleted_count} tasks for user: {user_email}")

            # Now delete the user document itself
            result = await db.users.delete_one({"email": user_email})
            if result.deleted_count == 1:
                print(f"Successfully deleted user document for: {user_email}")
                return True
            else:
                # This case should ideally not be reached if find_one found the user
                print(f"Deletion failed - user found but not deleted: {user_email}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to delete user account"
                )
        except Exception as e:
            print(f"Error during user deletion for {user_email}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An error occurred while deleting the user account."
            )

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.REFRESH_SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def refresh_access_token(refresh_token: str) -> Tuple[str, str]:
    """Generate new access token from refresh token"""
    from database import get_db
    db = await get_db()
    
    try:
        # Check token expiration first
        try:
            jwt.decode(refresh_token, settings.REFRESH_SECRET_KEY, algorithms=[settings.ALGORITHM], options={"verify_exp": True})
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token expired"
            )
            
        payload = jwt.decode(refresh_token, settings.REFRESH_SECRET_KEY, algorithms=[settings.ALGORITHM], options={"verify_exp": False})
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
            
        # Verify refresh token exists and hasn't been revoked
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
            
        token_valid = False
        now_utc = datetime.now(timezone.utc)
        for t_data in user.get("refresh_tokens", []):
            db_token_expires_at = t_data["expires_at"]
            # Ensure db_token_expires_at is offset-aware (UTC)
            if db_token_expires_at.tzinfo is None:
                db_token_expires_at = db_token_expires_at.replace(tzinfo=timezone.utc)
            
            if t_data["token"] == refresh_token and now_utc < db_token_expires_at:
                token_valid = True
                break
        
        if not token_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token revoked or expired"
            )
            
        # Generate new access token
        new_access_token = create_access_token(
            data={"sub": email},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        # Always rotate refresh token for better security
        new_refresh_token = create_refresh_token(
            data={"sub": email},
            expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )
        
        # Revoke old refresh token
        await db.users.update_one(
            {"email": email},
            {"$pull": {"refresh_tokens": {"token": refresh_token}}}
        )
        
        # Add new refresh token
        await db.users.update_one(
            {"email": email},
            {"$push": {"refresh_tokens": {
                "token": new_refresh_token,
                "expires_at": datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
            }}}
        )
        
        return new_access_token, new_refresh_token
        
    except PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid refresh token: {str(e)}"
        )

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except PyJWTError:
        raise credentials_exception
    
    from database import get_db
    db = await get_db()
    
    user = await db.users.find_one({"email": email})
    if not user:
        raise credentials_exception
        
    return UserInDB(**user)