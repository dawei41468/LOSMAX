from fastapi import APIRouter, Depends, HTTPException, status, Query # Added Query
from fastapi.security import OAuth2PasswordBearer
from typing import Optional # Added Optional

from models.user import User
from models.goal import GoalCreate, Goal, GoalStatus # Added GoalStatus
from services.auth_service import get_current_user
from services.goal_service import (
    create_goal,
    get_goals_by_user,
    update_goal,
    delete_goal,
    get_goal_by_id_and_user
)

router = APIRouter(prefix="/goals", tags=["goals"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.post("/", response_model=Goal, status_code=status.HTTP_201_CREATED)
async def create_new_goal(
    goal: GoalCreate,
    current_user: User = Depends(get_current_user)
):
    try:
        return await create_goal(goal, str(current_user.id))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/", response_model=list[Goal])
async def list_user_goals(
    current_user: User = Depends(get_current_user),
    status_filter: Optional[GoalStatus] = Query(None, alias="status") # Added status_filter
):
    return await get_goals_by_user(str(current_user.id), status_filter=status_filter)

@router.get("/{goal_id}", response_model=Goal)
async def get_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user)
):
    goal = await get_goal_by_id_and_user(goal_id, str(current_user.id))
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found or not authorized")
    return goal

@router.put("/{goal_id}", response_model=Goal)
async def update_existing_goal(
    goal_id: str,
    goal_update: dict,
    current_user: User = Depends(get_current_user)
):
    try:
        return await update_goal(goal_id, str(current_user.id), goal_update)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e))

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user)
):
    if not await delete_goal(goal_id, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found")
    return None