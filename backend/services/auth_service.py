from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from bson import ObjectId # Import ObjectId
from jose import jwt
from jose.exceptions import JWTError as PyJWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

from config.settings import settings
from models.user import UserCreate, UserInDB, RefreshToken
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

class AuthService:
    async def verify_websocket_token(self, token: str) -> Optional[str]:
        """Verify WebSocket JWT token and return user_id (string _id) if valid"""
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            user_id_str: str = payload.get("sub")
            if user_id_str is None:
                return None
            # Basic validation: ensure it's a non-empty string. Further validation (e.g. ObjectId format) could be added.
            if not isinstance(user_id_str, str) or not user_id_str:
                 return None
            return user_id_str
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
        
        # Prepare user document for insertion.
        # UserInDB model fields will be used by Pydantic for validation if we construct UserInDB first,
        # but for direct insertion, we build a dict.
        # MongoDB will auto-generate _id.
        user_doc_to_insert = {
            "email": user_data.email,
            "name": user_data.name,
            "hashed_password": hashed_password,
            "disabled": False,
            "refresh_tokens": [],
            # Set defaults for other UserInDB fields if they are not Optional
            "morning_deadline": "09:00 AM", # Default from UserInDB
            "evening_deadline": "10:00 PM", # Default from UserInDB
            "notifications_enabled": False, # Default from UserInDB
            "language": "en", # Default from UserInDB
            "role": "User" # Default role for new users
        }
        
        print(f"Creating user document: {user_doc_to_insert}")
        
        try:
            insert_result = await db.users.insert_one(user_doc_to_insert)
            user_mongo_id_obj = insert_result.inserted_id
            user_id_str = str(user_mongo_id_obj)
            print(f"Insert result: {user_id_str}")
        except Exception as e:
            print(f"Failed to insert user: {str(e)}")
            raise
        
        access_token = create_access_token(
            data={"sub": user_id_str}, # Use string _id for sub
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        refresh_token = create_refresh_token(
            data={"sub": user_id_str}, # Use string _id for sub
            expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )
        
        await db.users.update_one(
            {"_id": user_mongo_id_obj},
            {"$push": {"refresh_tokens": {
                "token": refresh_token,
                "expires_at": datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
            }}}
        )
        
        return {
            "id": user_id_str,
            "email": user_data.email,
            "name": user_data.name,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "role": "User", # Role for newly registered user
            "language": "en" # Default language for new user
        }

    @staticmethod # Changed from @classmethod as cls is not used
    async def authenticate_user(email: str, password: str) -> dict: # Removed cls
        from database import get_db
        db = await get_db()
        
        user_doc = await db.users.find_one({"email": email}) # Still find by email for login
        if not user_doc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
            
        if not verify_password(password, user_doc["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        user_id_str = str(user_doc["_id"]) # Get string _id
        user_role = user_doc.get("role", "User") # Get role, default to "User"

        access_token = create_access_token(
            data={"sub": user_id_str, "role": user_role}, # Include role in access token
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        refresh_token = create_refresh_token(
            data={"sub": user_id_str}, # Refresh token typically only needs sub
            expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )
        
        # Update user with new refresh token
        await db.users.update_one(
            {"_id": user_doc["_id"]}, # Query by _id
            {"$push": {"refresh_tokens": {
                "token": refresh_token,
                "expires_at": datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
            }}}
        )
        
        # Broadcast auth state to WebSocket clients
        # Removed websocket broadcast after simplifying implementation
        user_name = user_doc.get("name") # Get name from DB
        user_language = user_doc.get("language", "en") # Get language from DB, default to "en"
        # user_role is already fetched above
        return {
            "id": user_id_str,
            "email": email,
            "name": user_name,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "language": user_language,
            "role": user_role
        }

    @staticmethod
    async def update_user_name(user_id: str, new_name: str) -> dict: # Changed user_email to user_id
        from database import get_db
        db = await get_db()

        print(f"Attempting to update name for user ID: {user_id} to {new_name}")
        try:
            user_obj_id = ObjectId(user_id)
        except Exception:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format")

        user = await db.users.find_one({"_id": user_obj_id})
        if not user:
            print(f"Update name failed - user not found: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        result = await db.users.update_one(
            {"_id": user_obj_id},
            {"$set": {"name": new_name}}
        )

        if result.modified_count == 1:
            print(f"Successfully updated name for user ID: {user_id}")
            return {"id": user_id, "name": new_name, "email": user["email"]}
        elif result.matched_count == 1 and result.modified_count == 0:
            print(f"User ID {user_id} name is already {new_name}.")
            return {"id": user_id, "name": new_name, "email": user["email"]}
        else:
            print(f"Update name failed for user ID: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user name"
            )

    @staticmethod
    async def change_password(user_id: str, current_password: str, new_password: str) -> bool: # Changed user_email to user_id
        from database import get_db
        db = await get_db()

        print(f"Attempting to change password for user ID: {user_id}")
        try:
            user_obj_id = ObjectId(user_id)
        except Exception:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format")

        user_doc = await db.users.find_one({"_id": user_obj_id})
        if not user_doc:
            print(f"Change password failed - user not found: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if not verify_password(current_password, user_doc["hashed_password"]):
            print(f"Change password failed - incorrect current password for user ID: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password"
            )

        new_hashed_password = get_password_hash(new_password)
        
        # Update password and clear all existing refresh tokens for security
        result = await db.users.update_one(
            {"_id": user_obj_id},
            {"$set": {"hashed_password": new_hashed_password, "refresh_tokens": []}}
        )

        if result.modified_count == 1:
            print(f"Successfully changed password and cleared refresh tokens for user ID: {user_id}")
            return True
        else:
            print(f"Change password failed (or no change made) for user ID: {user_id}")
            if result.matched_count == 1:
                 print(f"Password for user ID {user_id} was not changed (possibly same as old), but refresh tokens cleared.")
                 return True
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to change password"
            )

    @staticmethod
    async def delete_user(user_id: str) -> bool: # Changed user_email to user_id
        from database import get_db
        db = await get_db()

        print(f"Attempting to delete user with ID: {user_id}") # Debug log
        try:
            user_obj_id = ObjectId(user_id)
        except Exception:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format")

        user_to_delete = await db.users.find_one({"_id": user_obj_id})
        if not user_to_delete:
            print(f"Deletion failed - user not found: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        try:
            # Delete associated goals (user_id in goals is already string _id)
            delete_goals_result = await db.goals.delete_many({"user_id": user_id})
            print(f"Deleted {delete_goals_result.deleted_count} goals for user ID: {user_id}")

            # Delete associated tasks (user_id in tasks is already string _id)
            delete_tasks_result = await db.tasks.delete_many({"user_id": user_id})
            print(f"Deleted {delete_tasks_result.deleted_count} tasks for user ID: {user_id}")

            # Now delete the user document itself
            result = await db.users.delete_one({"_id": user_obj_id})
            if result.deleted_count == 1:
                print(f"Successfully deleted user document for ID: {user_id}")
                return True
            else:
                print(f"Deletion failed - user found but not deleted: {user_id}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to delete user account"
                )
        except Exception as e:
            print(f"Error during user deletion for ID {user_id}: {str(e)}")
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
        user_id_str: str = payload.get("sub") # Changed email to user_id_str
        if user_id_str is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token (no sub)"
            )
        
        try:
            user_obj_id = ObjectId(user_id_str)
        except Exception:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token (sub not ObjectId)")

        # Verify refresh token exists and hasn't been revoked
        user_doc = await db.users.find_one({"_id": user_obj_id}) # Query by _id
        if not user_doc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found for refresh token"
            )
            
        token_valid = False
        now_utc = datetime.now(timezone.utc)
        for t_data in user_doc.get("refresh_tokens", []): # Use user_doc
            db_token_expires_at = t_data["expires_at"]
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
            
        user_role = user_doc.get("role", "User") # Get role for the new access token
        # Generate new access token
        new_access_token = create_access_token(
            data={"sub": user_id_str, "role": user_role}, # Include role in new access token
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        # Always rotate refresh token for better security
        new_refresh_token = create_refresh_token(
            data={"sub": user_id_str}, # Refresh token typically only needs sub
            expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )
        
        # Revoke old refresh token
        await db.users.update_one(
            {"_id": user_obj_id}, # Query by _id
            {"$pull": {"refresh_tokens": {"token": refresh_token}}}
        )
        
        # Add new refresh token
        await db.users.update_one(
            {"_id": user_obj_id}, # Query by _id
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

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB: # Added return type
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: Optional[str] = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except PyJWTError:
        raise credentials_exception
    
    from database import get_db
    db = await get_db()

    try:
        user_obj_id = ObjectId(user_id_str)
    except Exception: # Invalid ObjectId format in token sub
        raise credentials_exception
        
    db_user_data = await db.users.find_one({"_id": user_obj_id})
    if not db_user_data:
        raise credentials_exception
    
    # Prepare data for Pydantic model, ensuring 'id' is string representation of '_id'
    user_data_for_pydantic = {}
    # Ensure all fields expected by UserInDB are considered
    # This loop helps if UserInDB has more fields than just 'id' and those from db_user_data
    for field_name in UserInDB.model_fields:
        if field_name == "id":
            user_data_for_pydantic["id"] = str(db_user_data["_id"])
        elif field_name in db_user_data:
            user_data_for_pydantic[field_name] = db_user_data[field_name]
        # Optional: handle missing fields with defaults if UserInDB defines them and they aren't in db_user_data
        # else:
            # user_data_for_pydantic[field_name] = UserInDB.model_fields[field_name].default
            # This part is tricky if default_factory is used or if field is required and missing.
            # For now, assume all necessary fields are in db_user_data or optional in UserInDB.

    try:
        return UserInDB(**user_data_for_pydantic)
    except Exception as e: # Catch Pydantic validation error or other issues
        raise credentials_exception