from fastapi import HTTPException, status
from models.user import UserInDB, UserPreferencesResponse, UserPreferencesUpdate # Import UserPreferencesUpdate
from database import get_db

class PreferencesService:
    @staticmethod
    async def get_user_preferences(user_email: str) -> UserPreferencesResponse:
        db = await get_db()
        user_data = await db.users.find_one({"email": user_email})
        
        if not user_data:
            # This case should ideally not happen if the user_email comes from an authenticated token
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # UserInDB model now has defaults for preference fields
        user = UserInDB(**user_data)
        
        return UserPreferencesResponse(
            morning_deadline=user.morning_deadline,
            evening_deadline=user.evening_deadline,
            notifications_enabled=user.notifications_enabled,
            language=user.language
        )

    @staticmethod
    async def update_user_preferences(user_email: str, preferences_update: UserPreferencesUpdate) -> UserPreferencesResponse: # Use imported type
        db = await get_db()
        user = await db.users.find_one({"email": user_email})

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        update_data = preferences_update.dict(exclude_unset=True)
        
        if not update_data:
            # No actual updates provided, just return current preferences
            return await PreferencesService.get_user_preferences(user_email)

        await db.users.update_one(
            {"email": user_email},
            {"$set": update_data}
        )
        
        # Fetch and return the updated user's preferences
        updated_user_data = await db.users.find_one({"email": user_email})
        # Ensure updated_user_data is not None before creating UserInDB instance
        if not updated_user_data:
             raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, # Or 500, as this should not happen if update was successful
                detail="User data not found after update."
            )
        
        updated_user = UserInDB(**updated_user_data)

        return UserPreferencesResponse(
            morning_deadline=updated_user.morning_deadline,
            evening_deadline=updated_user.evening_deadline,
            notifications_enabled=updated_user.notifications_enabled,
            language=updated_user.language
        )