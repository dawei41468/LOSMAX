from datetime import datetime
from typing import Optional
from pymongo import ReturnDocument
from models.goal import Goal, GoalCreate
from utils.constants import CATEGORIES
from database import db
from fastapi import HTTPException, status

class GoalService:
    def __init__(self):
        self.collection = db.goals

    async def create_goal(self, goal_data: GoalCreate) -> Goal:
        """Create a new goal with validation"""
        await self._validate_category_limit(goal_data.user_id, goal_data.category)
        goal = Goal(**goal_data.dict(), created_at=datetime.utcnow(), updated_at=datetime.utcnow())
        result = await self.collection.insert_one(goal.dict(by_alias=True))
        goal.id = str(result.inserted_id)
        return goal

    async def get_goal(self, goal_id: str) -> Optional[Goal]:
        """Get a goal by ID"""
        result = await self.collection.find_one({"_id": goal_id})
        return Goal(**result) if result else None

    async def get_goals_by_user(self, user_id: str) -> list[Goal]:
        """Get all goals for a user"""
        cursor = self.collection.find({"user_id": user_id})
        return [Goal(**doc) async for doc in cursor]

    async def update_goal(self, goal_id: str, user_id: str, update_data: dict) -> Optional[Goal]:
        """Update a goal"""
        existing_goal = await self.get_goal(goal_id)
        if not existing_goal or existing_goal.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found or not authorized")

        # Category is immutable, remove it from update_data if present
        update_data.pop("category", None)
        
        if not update_data: # No fields to update after removing category
            return existing_goal # Return existing goal if no updates

        update_data["updated_at"] = datetime.utcnow()
        
        result = await self.collection.find_one_and_update(
            {"_id": goal_id},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER
        )
        return Goal(**result) if result else None

    async def delete_goal(self, goal_id: str, user_id: str) -> bool:
        """Delete a goal"""
        existing_goal = await self.get_goal(goal_id)
        if not existing_goal or existing_goal.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found or not authorized")
            
        result = await self.collection.delete_one({"_id": goal_id})
        return result.deleted_count > 0

    async def _validate_category_limit(self, user_id: str, category: str):
        """Validate user doesn't exceed category limit for active goals"""
        if category not in CATEGORIES:
            raise ValueError(f"Invalid category. Must be one of: {CATEGORIES}")
        
        count = await self.collection.count_documents({
            "user_id": user_id,
            "category": category,
            "status": "active" # Only count active goals
        })
        if count >= 3:  # Max 3 active goals per category
            raise ValueError("Maximum 3 active goals allowed per category")

# Module-level function exports for convenience
_goal_service = GoalService()

async def create_goal(goal_data: GoalCreate, user_id: str) -> Goal:
    """Create a new goal (module-level wrapper)"""
    goal_data.user_id = user_id # Ensure user_id is set in GoalCreate
    return await _goal_service.create_goal(goal_data)

async def get_goals_by_user(user_id: str) -> list[Goal]:
    """Get all goals for a user (module-level wrapper)"""
    return await _goal_service.get_goals_by_user(user_id)

async def update_goal(goal_id: str, user_id: str, update_data: dict) -> Optional[Goal]:
    """Update a goal (module-level wrapper)"""
    return await _goal_service.update_goal(goal_id, user_id, update_data)

async def delete_goal(goal_id: str, user_id: str) -> bool:
    """Delete a goal (module-level wrapper)"""
    return await _goal_service.delete_goal(goal_id, user_id)

async def get_goal_by_id_and_user(goal_id: str, user_id: str) -> Optional[Goal]:
    """Get a goal by ID with user authorization (module-level wrapper)"""
    existing_goal = await _goal_service.get_goal(goal_id)
    if not existing_goal or existing_goal.user_id != user_id:
        return None
    return existing_goal
