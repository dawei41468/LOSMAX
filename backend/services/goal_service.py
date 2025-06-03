from datetime import datetime
from typing import Optional
from pymongo import ReturnDocument
from bson import ObjectId # Import ObjectId
from pydantic import ValidationError
import logging # Use logging module
from models.goal import Goal, GoalCreate, GoalStatus
from utils.constants import CATEGORIES
from database import db
from fastapi import HTTPException, status

class GoalService:
    def __init__(self):
        self.collection = db.goals

    async def create_goal(self, goal_data: GoalCreate, user_id: str) -> Goal: # Add user_id parameter
        """Create a new goal with validation"""
        await self._validate_category_limit(user_id, goal_data.category) # Use user_id parameter
        # Construct the goal document for insertion, explicitly adding user_id
        goal_doc = goal_data.model_dump()
        goal_doc["user_id"] = user_id
        goal_doc["created_at"] = datetime.utcnow()
        goal_doc["updated_at"] = datetime.utcnow()
        # Ensure status is set if not provided, though GoalBase has a default
        goal_doc.setdefault("status", GoalStatus.ACTIVE.value)


        # The Goal model includes user_id, so we can create it before insertion for validation if needed,
        # or insert the dict and then construct Goal for the return value.
        # For now, let's insert the dict and then construct.
        
        result = await self.collection.insert_one(goal_doc)
        
        # Construct the Goal object for the return value, including the new id
        # and all other fields from goal_doc.
        # The Goal model expects 'id', not '_id'.
        # The 'id' field in the Goal model is for the response, not direct DB field name.
        # Pydantic's from_attributes=True in Goal.Config should handle mapping if we fetch then model.
        # Here, we construct it manually post-insert.
        
        # Create a complete dict for Goal model instantiation
        final_goal_data = {**goal_doc, "id": str(result.inserted_id)}
        # Remove MongoDB's _id if it was accidentally included in goal_doc,
        # though it shouldn't be as we built goal_doc from GoalCreate.
        final_goal_data.pop("_id", None)


        goal = Goal(**final_goal_data)
        return goal

    async def get_goal(self, goal_id: str) -> Optional[Goal]:
        """Get a goal by ID"""
        try:
            obj_goal_id = ObjectId(goal_id)
        except Exception:
            # Invalid ObjectId format, so goal cannot exist
            return None
        result = await self.collection.find_one({"_id": obj_goal_id})
        if result:
            # Ensure 'id' is correctly mapped from '_id' for Pydantic model
            if "_id" in result and "id" not in result:
                 result["id"] = str(result["_id"])
            # result.pop("_id", None) # Not strictly necessary if Pydantic handles alias or from_attributes
            return Goal(**result)
        return None

    async def get_goals_by_user(self, user_id: str, status_filter: Optional[GoalStatus] = None) -> list[Goal]:
        """Get goals for a user, optionally filtered by status."""
        query = {"user_id": user_id}
        if status_filter:
            query["status"] = status_filter.value
        cursor = self.collection.find(query)
        
        valid_goals = []
        async for doc in cursor:
            try:
                # Ensure 'id' is correctly mapped from '_id' for Pydantic model
                # Pydantic's from_attributes=True and alias for _id might handle this,
                # but being explicit can help if 'id' is expected directly by Goal model.
                # The Goal model expects 'id', not '_id'.
                if "_id" in doc and "id" not in doc: # Check if 'id' is already there
                    doc["id"] = str(doc["_id"])
                
                # Remove '_id' after mapping to 'id' to prevent Pydantic confusion if it's not aliased
                # and 'id' is the primary identifier in the Pydantic model.
                # However, if Goal.Config has alias for _id -> id, this might not be needed.
                # For now, let's assume 'id' is the field in Pydantic model.
                # doc.pop("_id", None) # Let's test without popping first, as from_attributes might handle it.

                valid_goals.append(Goal(**doc))
            except ValidationError as e:
                goal_id_for_log = doc.get("id", str(doc.get("_id", "Unknown ID")))
                logging.error(f"Skipping goal due to validation error. Goal ID: {goal_id_for_log}. Error: {e.json()}")
            except Exception as e: # Catch any other unexpected error during processing a single doc
                goal_id_for_log = doc.get("id", str(doc.get("_id", "Unknown ID")))
                logging.error(f"Skipping goal due to unexpected error. Goal ID: {goal_id_for_log}. Error: {e}")
        return valid_goals

    async def update_goal(self, goal_id: str, user_id: str, update_data: dict) -> Optional[Goal]:
        """Update a goal"""
        existing_goal = await self.get_goal(goal_id)
        if not existing_goal or existing_goal.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found or not authorized")

        # Category is immutable, remove it from update_data if present
        update_data.pop("category", None)

        # Handle completed_at based on status
        if "status" in update_data:
            if update_data["status"] == GoalStatus.COMPLETED.value:
                update_data["completed_at"] = datetime.utcnow()
            elif update_data["status"] == GoalStatus.ACTIVE.value:
                update_data["completed_at"] = None
        
        # If only category was in update_data and it was popped, or no actual changes
        if not update_data or all(value == getattr(existing_goal, key, None) for key, value in update_data.items() if key not in ["updated_at", "completed_at"]):
             # Check if completed_at also needs to be considered for "no actual changes"
            if "status" not in update_data and not any(key for key in update_data if key not in ["updated_at", "completed_at"]): # no other fields to update
                 return existing_goal


        update_data["updated_at"] = datetime.utcnow()
        
        try:
            obj_goal_id = ObjectId(goal_id)
        except Exception:
            # This case should ideally be caught by get_goal earlier if goal_id is invalid
            # but as a safeguard:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid goal ID format for update")

        result = await self.collection.find_one_and_update(
            {"_id": obj_goal_id}, # Use ObjectId for the query
            {"$set": update_data},
            return_document=ReturnDocument.AFTER
        )
        
        if result:
            # Ensure 'id' is correctly mapped from '_id' for Pydantic model
            if "_id" in result and "id" not in result:
                 result["id"] = str(result["_id"])
            # result.pop("_id", None) # Not strictly necessary
            return Goal(**result)
        return None # Explicitly return None if no document was updated/found

    async def delete_goal(self, goal_id: str, user_id: str) -> bool:
        """Delete a goal"""
        existing_goal = await self.get_goal(goal_id) # get_goal now handles ObjectId conversion for its own find_one
        if not existing_goal or existing_goal.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found or not authorized")
        
        try:
            obj_goal_id = ObjectId(goal_id)
        except Exception:
            # This should ideally not be reached if get_goal above found the goal,
            # as get_goal would have failed for an invalid ObjectId format.
            # However, as a safeguard for the delete_one operation itself:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid goal ID format for delete")

        result = await self.collection.delete_one({"_id": obj_goal_id}) # Use ObjectId
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
    # user_id is now passed directly to the service method
    return await _goal_service.create_goal(goal_data, user_id)

async def get_goals_by_user(user_id: str, status_filter: Optional[GoalStatus] = None) -> list[Goal]:
    """Get goals for a user, optionally filtered by status (module-level wrapper)"""
    return await _goal_service.get_goals_by_user(user_id, status_filter)

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
