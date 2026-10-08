from pydantic import BaseModel
from datetime import datetime



class AccessToken(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

class CreateUser(BaseModel):
    username: str
    email: str
    password: str

class User(BaseModel):
    id: int
    username: str
    email: str
    profile_image_url: str | None
    date: datetime

class OtherUser(BaseModel):
    id: int
    username: str
    email: str
    profile_image_url: str | None

class Users(BaseModel):
    users: list[OtherUser]
    has_more: bool

class Task(BaseModel):
    id: int
    title: str
    done: bool

class CreateTask(BaseModel):
    title: str

class TaskUpdate(BaseModel):
    task_id: int
    done: bool

class TasksToDelete(BaseModel):
    ids: list[int]
