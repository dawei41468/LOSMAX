from fastapi import APIRouter, Depends, HTTPException, status
from models.user import UserInDB, UserPreferencesResponse
from services.auth_service import get_current_user
from services.preferences_service import PreferencesService

router = APIRouter(prefix="/preferences", tags=["preferences"])

@router.get("", response_model=UserPreferencesResponse)
async def read_user_preferences(current_user: UserInDB = Depends(get_current_user)):
    """
    Retrieve the current authenticated user's preferences.
    """
    try:
        preferences = await PreferencesService.get_user_preferences(user_email=current_user.email)
        return preferences
    except HTTPException as e:
        # Re-raise HTTPExceptions (e.g., user not found from service)
        raise e
    except Exception as e:
        # Catch any other unexpected errors
        print(f"Unexpected error fetching preferences for {current_user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while fetching preferences."
        )

from models.user import UserPreferencesUpdate # Import UserPreferencesUpdate

@router.patch("", response_model=UserPreferencesResponse)
async def update_user_preferences_route(
    preferences_update: UserPreferencesUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Update the current authenticated user's preferences.
    Allows partial updates.
    """
    try:
        updated_preferences = await PreferencesService.update_user_preferences(
            user_email=current_user.email,
            preferences_update=preferences_update
        )
        return updated_preferences
    except HTTPException as e:
        # Re-raise HTTPExceptions (e.g., user not found from service)
        raise e
    except Exception as e:
        # Catch any other unexpected errors
        print(f"Unexpected error updating preferences for {current_user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while updating preferences."
        )