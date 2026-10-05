from fastapi import APIRouter, Depends, File, HTTPException, Path, Request, UploadFile, status
from fastapi.security import OAuth2PasswordBearer

from app.database import execute_query
from app.functions import decode_access_token
from app.models import OtherUser, User

import uuid
from pathlib import Path




BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"

auth_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


users_router = APIRouter(
    prefix = "/users",
    tags = ["Users"]
)

@users_router.get("", response_model = list[OtherUser])
async def get_users(access_token: str = Depends(auth_scheme)):
    user_data = await decode_access_token(access_token)
    users = await execute_query("SELECT id, username, email, profile_image_url FROM users WHERE id != %s", (user_data["id"],))
    return users

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
    
    # Delete the old profile image
    old_image = await execute_query("SELECT profile_image_url FROM users WHERE id = %s", (user_data["id"],))

    if old_image and old_image[0]["profile_image_url"]:
        old_path = old_image[0]["profile_image_url"]

        old_filename = Path(old_path).name
        old_file = UPLOAD_DIR / old_filename

        if old_file.exists():
            old_file.unlink()

    # Create a unique file path
    extension = Path(image.filename).suffix
    filename = f"{uuid.uuid4()}{extension}"

    file_path = UPLOAD_DIR / filename

    # Save the image
    with open(file_path, "wb") as file:
        file.write(await image.read())

    # Save the URL in the database
    image_path = f"/uploads/{filename}"

    await execute_query("UPDATE users SET profile_image_url = %s WHERE id = %s", (image_path, user_data["id"]))

    return {
        "message": "Image uploaded successfully",
        "profile_image_url": image_path
    }

  