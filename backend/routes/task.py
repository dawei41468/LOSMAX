from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Optional

from models.user import User
from models.task import TaskCreate, Task, TaskStatus
from services.auth_service import get_current_user
from services.task_service import (
    create_task,
    get_tasks_by_user,
    update_task,
    delete_task
)

router = APIRouter(prefix="/tasks", tags=["tasks"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_valid_status(status: Optional[str] = None) -> Optional[TaskStatus]:
    if status is None:
        return None
    try:
        return TaskStatus(status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status value: {status}. Allowed values are {', '.join([s.value for s in TaskStatus])}"
        )

@router.post("/", response_model=Task, status_code=status.HTTP_201_CREATED)
async def create_new_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_user)
):
    try:
        return await create_task(task, str(current_user.id))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException as e:
        raise e

@router.get("/", response_model=list[Task])
async def list_user_tasks(
    status: Optional[TaskStatus] = Depends(get_valid_status),
    filter: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    tasks = await get_tasks_by_user(str(current_user.id))
    if status:
        tasks = [task for task in tasks if task.status == status]
    if filter == "today":
        from datetime import datetime, date
        today = date.today()
        tasks = [task for task in tasks if task.created_at.date() == today]
    return tasks

@router.get("/{task_id}", response_model=Task)
async def get_task(
    task_id: str,
    current_user: User = Depends(get_current_user)
):
    tasks = await get_tasks_by_user(str(current_user.id))
    task = next((t for t in tasks if t.id == task_id), None)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or not authorized")
    return task

@router.put("/{task_id}", response_model=Task)
async def update_existing_task(
    task_id: str,
    task_update: dict,
    current_user: User = Depends(get_current_user)
):
    try:
        updated_task = await update_task(task_id, str(current_user.id), task_update)
        if not updated_task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or not authorized")
        return updated_task
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e))

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_task(
    task_id: str,
    current_user: User = Depends(get_current_user)
):
    if not await delete_task(task_id, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or not authorized")
    return None