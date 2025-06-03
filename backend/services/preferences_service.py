from fastapi import HTTPException, status
from bson import ObjectId # Import ObjectId
from models.user import UserInDB, UserPreferencesResponse, UserPreferencesUpdate # Import UserPreferencesUpdate
from database import get_db

class PreferencesService:
    @staticmethod
    async def get_user_preferences(user_id: str) -> UserPreferencesResponse: # Changed user_email to user_id
        db = await get_db()
        # Ensure user_id is a valid ObjectId string before querying
        try:
            user_obj_id = ObjectId(user_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID format"
            )
        user_data = await db.users.find_one({"_id": user_obj_id})
        
        if not user_data:
            # This case should ideally not happen if the user_email comes from an authenticated token
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # UserInDB model now has defaults for preference fields
        user_data_for_pydantic = {}
        if user_data: # Ensure user_data is not None
            for field_name in UserInDB.model_fields:
                if field_name == "id" and "_id" in user_data:
                    user_data_for_pydantic["id"] = str(user_data["_id"])
                elif field_name in user_data:
                    user_data_for_pydantic[field_name] = user_data[field_name]
        
        user = UserInDB(**user_data_for_pydantic)
        
        return UserPreferencesResponse(
            morning_deadline=user.morning_deadline,
            evening_deadline=user.evening_deadline,
            notifications_enabled=user.notifications_enabled,
            language=user.language
        )

    @staticmethod
    async def update_user_preferences(user_id: str, preferences_update: UserPreferencesUpdate) -> UserPreferencesResponse: # Changed user_email to user_id
        db = await get_db()
        # Ensure user_id is a valid ObjectId string before querying
        try:
            user_obj_id = ObjectId(user_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID format"
            )
        user = await db.users.find_one({"_id": user_obj_id})

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        update_data = preferences_update.dict(exclude_unset=True)
        
        if not update_data:
            # No actual updates provided, just return current preferences
            return await PreferencesService.get_user_preferences(user_id) # Changed user_email to user_id

        await db.users.update_one(
            {"_id": user_obj_id}, # Changed to query by _id
            {"$set": update_data}
        )
        
        # Fetch and return the updated user's preferences
        updated_user_data = await db.users.find_one({"_id": user_obj_id}) # Changed to query by _id
        # Ensure updated_user_data is not None before creating UserInDB instance
        if not updated_user_data:
             raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, # Or 500, as this should not happen if update was successful
                detail="User data not found after update."
            )
        
        updated_user_data_for_pydantic = {}
        if updated_user_data: # Ensure updated_user_data is not None
            for field_name in UserInDB.model_fields:
                if field_name == "id" and "_id" in updated_user_data:
                    updated_user_data_for_pydantic["id"] = str(updated_user_data["_id"])
                elif field_name in updated_user_data:
                    updated_user_data_for_pydantic[field_name] = updated_user_data[field_name]

        updated_user = UserInDB(**updated_user_data_for_pydantic)

        return UserPreferencesResponse(
            morning_deadline=updated_user.morning_deadline,
            evening_deadline=updated_user.evening_deadline,
            notifications_enabled=updated_user.notifications_enabled,
            language=updated_user.language
        )