from fastapi import APIRouter, Depends, File, HTTPException, Path, UploadFile, status
from fastapi.security import OAuth2PasswordBearer

from app.database import execute_query
from app.functions import decode_access_token
from app.models import OtherUser, User, Users
from app.settings import settings
from app.storage import supabase

import uuid
from pathlib import Path






auth_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


users_router = APIRouter(
    prefix = "/users",
    tags = ["Users"]
)

@users_router.get("", response_model = Users)
async def get_users(access_token: str = Depends(auth_scheme), limit: int = 20, offset: int = 0):
    user_data = await decode_access_token(access_token)
    users = await execute_query("SELECT id, username, email, profile_image_url FROM users WHERE id != %s LIMIT %s OFFSET %s", (user_data["id"], limit + 1, offset))
    if len(users) == limit + 1:
        return {"users": users[:limit], "has_more": True}
    return {"users": users, "has_more": False}

@users_router.get("/me", response_model= User) 
async def get_profile(access_token: str = Depends(auth_scheme)):
    data = await decode_access_token(access_token)
    return data

@users_router.get("/{username}", response_model = OtherUser)
async def get_user(username: str):
    user = await execute_query("SELECT id, username, email, profile_image_url FROM users WHERE username = %s", (username))
    if user is None or not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        
    return user[0]

@users_router.post("/profile-image") 
async def get_profile_image(access_token: str = Depends(auth_scheme), image: UploadFile = File(...)):
    user_data = await decode_access_token(access_token)

    types = {
        "image/jpeg",
        "image/webp",
        "image/png",
        "image/jfif"
    }

    if image.content_type not in types:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only JPEG, Webp, PNG and JFIF images are allowed")
    
    # get the old image url
    old_image = await execute_query("SELECT profile_image_url FROM users WHERE id = %s", (user_data["id"],))

    # Create a unique filename and a copy image
    extension = Path(image.filename).suffix
    filename = f"{uuid.uuid4()}{extension}"

    file_data = await image.read()

    # Save the image
    print(4)
    supabase.storage.from_(settings.SUPABASE_BUCKET).upload(
        filename,
        file_data,
        {
            "content-type": image.content_type,
            "upsert": "false"
        }
    )
    print(5)

    # Save the URL in the database
    print(6)
    image_url = supabase.storage.from_(settings.SUPABASE_BUCKET).get_public_url(filename)
    print(7)

    await execute_query("UPDATE users SET profile_image_url = %s WHERE id = %s", (image_url, user_data["id"]))

    # Delete the old profile image
    if old_image and old_image[0]["profile_image_url"]:
        old_url = old_image[0]["profile_image_url"]
        old_path = Path(old_url).name
        print(old_path)
        supabase.storage.from_(settings.SUPABASE_BUCKET).remove([old_path])



    return {
        "message": "Image uploaded successfully",
        "profile_image_url": image_url
    }

  