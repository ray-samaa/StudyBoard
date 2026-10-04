from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.database import execute_query
from app.functions import decode_access_token
from app.models import CreateTask, Task, TaskUpdate, TasksToDelete



auth_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


tasks_router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)

@tasks_router.get("", response_model=list[Task])
async def get_tasks(access_token: str = Depends(auth_scheme)):
    user_data = await decode_access_token(access_token)

    tasks = await execute_query("SELECT id, title, done FROM tasks WHERE user_id = %s", (user_data["id"]))

    return tasks

@tasks_router.post("", response_model=list[Task])
async def create_task(task_info: CreateTask, access_token: str = Depends(auth_scheme) ):
    user_data = await decode_access_token(access_token)

    task = await execute_query("SELECT id FROM tasks WHERE title = %s and user_id = %s", (task_info.title, user_data["id"]))
    if task:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="The task already exists.")

    await execute_query("INSERT INTO tasks(title, user_id) VALUES (%s, %s)", (task_info.title, user_data["id"]))

    tasks = await execute_query("SELECT id, title, done FROM tasks WHERE user_id = %s", (user_data["id"]))

    return tasks

@tasks_router.delete("", response_model=list[Task])
async def delete_task(tasks_id: TasksToDelete, access_token: str = Depends(auth_scheme)):
    user_data = await decode_access_token(access_token)
    placeholder = ", ".join(["%s"] * len(tasks_id.ids))
    await execute_query(f"DELETE FROM tasks WHERE id IN ({placeholder}) AND user_id = %s", (*tasks_id.ids, user_data["id"]))
    
    tasks = await execute_query("SELECT id, title, done FROM tasks WHERE user_id = %s", (user_data["id"]))

    return tasks

@tasks_router.patch("", response_model=list[Task])
async def edit_tasks(task_data: TaskUpdate, access_token: str = Depends(auth_scheme)):
    user_data = await decode_access_token(access_token)

    task = await execute_query("SELECT id FROM tasks WHERE id = %s and user_id = %s", (task_data.task_id, user_data["id"]))
    if task is None or not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="The task not exists.")

    new_status = not task_data.done
    await execute_query("UPDATE tasks SET done = %s WHERE id = %s AND user_id = %s", (new_status, task_data.task_id, user_data["id"]))

    tasks = await execute_query("SELECT id, title, done FROM tasks WHERE  user_id = %s", (user_data["id"]))

    return tasks

