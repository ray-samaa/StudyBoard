from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from app.settings import settings
from app.database import execute_query
from app.functions import create_access_token, create_refresh_token
from app.models import AccessToken, CreateUser

from pwdlib import PasswordHash





password_hash = PasswordHash.recommended()

auth_router = APIRouter(
    prefix = "/auth",
    tags = ["Auth"]
)

auth_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@auth_router.post("/signup", response_model = AccessToken, status_code=status.HTTP_201_CREATED)
async def signup(request: Request, response: Response, user: CreateUser):
    searched_user = await execute_query("SELECT username FROM users WHERE username = %s OR email = %s", (user.username, user.email))
    if searched_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username or email already exists")
    
    hashed_password = password_hash.hash(user.password)
    await execute_query("INSERT INTO users(username, email, password) VALUES (%s, %s, %s)", (user.username, user.email, hashed_password))

    created_user = await execute_query("SELECT id, username, email FROM users WHERE username = %s", (user.username))

    access_token = await create_refresh_token(request, response, created_user[0]["id"])
    
    return {"access_token": access_token, "token_type": "bearer", "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60 }

@auth_router.post("/login")
async def login(request: Request, response: Response, user_info: OAuth2PasswordRequestForm = Depends()):
    searched_user = await execute_query("SELECT id, username, password FROM users WHERE username = %s ", (user_info.username,))
    if searched_user is None or not searched_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    stored_hash = searched_user[0]["password"]
    if not password_hash.verify(user_info.password, stored_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    access_token = await create_refresh_token(request, response, searched_user[0]["id"])

    return {"access_token": access_token, "token_type": "bearer", "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60}

@auth_router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully."}

@auth_router.post("/refresh")
async def refresh(request: Request):
    access_token = await create_access_token(request)
    return {"access_token": access_token, "token_type": "bearer", "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60}

