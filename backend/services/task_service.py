from datetime import datetime, timezone
from typing import Optional
from pymongo import ReturnDocument
from models.task import Task, TaskCreate
from database import db
from fastapi import HTTPException, status
from services.goal_service import get_goal_by_id_and_user

class TaskService:
    def __init__(self):
        self.collection = db.tasks

    async def create_task(self, task_data: TaskCreate, user_id: str) -> Task:
        """Create a new task with validation"""
        # Verify goal exists and belongs to user
        goal = await get_goal_by_id_and_user(task_data.goal_id, user_id)
        if not goal:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Goal not found or not authorized"
            )

        task_dict = task_data.model_dump()
        task_dict.update({
            "user_id": user_id,
            "created_at": datetime.now(timezone.utc)
        })
        result = await self.collection.insert_one(task_dict)
        task = Task(
            **task_dict,
            id=str(result.inserted_id)
        )
        return task

    async def get_task(self, task_id: str) -> Optional[Task]:
        """Get a task by ID"""
        result = await self.collection.find_one({"_id": task_id})
        return Task(**result) if result else None

    async def get_tasks_by_user(self, user_id: str) -> list[Task]:
        """Get all tasks for a user"""
        cursor = self.collection.find({"user_id": user_id})
        return [Task(**doc) async for doc in cursor]

    async def get_tasks_by_goal(self, goal_id: str, user_id: str) -> list[Task]:
        """Get all tasks for a specific goal"""
        cursor = self.collection.find({"goal_id": goal_id, "user_id": user_id})
        return [Task(**doc) async for doc in cursor]

    async def update_task(self, task_id: str, user_id: str, update_data: dict) -> Optional[Task]:
        """Update a task"""
        existing_task = await self.get_task(task_id)
        if not existing_task or existing_task.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or not authorized"
            )

        result = await self.collection.find_one_and_update(
            {"_id": task_id},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER
        )
        return Task(**result) if result else None

    async def delete_task(self, task_id: str, user_id: str) -> bool:
        """Delete a task"""
        existing_task = await self.get_task(task_id)
        if not existing_task or existing_task.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or not authorized"
            )
            
        result = await self.collection.delete_one({"_id": task_id})
        return result.deleted_count > 0

# Module-level function exports for convenience
_task_service = TaskService()

async def create_task(task_data: TaskCreate, user_id: str) -> Task:
    """Create a new task (module-level wrapper)"""
    return await _task_service.create_task(task_data, user_id)

async def get_tasks_by_user(user_id: str) -> list[Task]:
    """Get all tasks for a user (module-level wrapper)"""
    return await _task_service.get_tasks_by_user(user_id)

async def get_tasks_by_goal(goal_id: str, user_id: str) -> list[Task]:
    """Get all tasks for a specific goal (module-level wrapper)"""
    return await _task_service.get_tasks_by_goal(goal_id, user_id)

async def update_task(task_id: str, user_id: str, update_data: dict) -> Optional[Task]:
    """Update a task (module-level wrapper)"""
    return await _task_service.update_task(task_id, user_id, update_data)

async def delete_task(task_id: str, user_id: str) -> bool:
    """Delete a task (module-level wrapper)"""
    return await _task_service.delete_task(task_id, user_id)