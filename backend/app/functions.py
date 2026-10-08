from fastapi import HTTPException, Request, Response, status
import jwt
from app.settings import settings
from app.models import User
from datetime import datetime, timedelta, timezone
from app.database import execute_query

# auth
async def create_refresh_token(request: Request, response: Response, user_id: int):
    """
    Create a refresh token and an access token, and save it as a HTTPonly cookie.
    Returns the access token.
    """
    try:
        payload = {
            "sub": str(user_id),
            "exp": datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        }

        refresh_token = jwt.encode(payload, key = settings.REFRESH_TOKEN_SECRET_KEY, algorithm = settings.ALGORITHM)

        response.set_cookie(
            key = "refresh_token",
            value = refresh_token,
            max_age = ( (settings.REFRESH_TOKEN_EXPIRE_DAYS * 24) * 60) * 60,
            httponly = True,
            secure = True,
            samesite = "none"
        )


        return await create_access_token(request, user_id)


    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{e}")

async def create_access_token(request: Request, user_id: int | None = None):
    """
    Create an access token, and raise HTTP_401_UNAUTHORIZED if the refresh token expired.
    Returns the access token.
    """

    try:
        if not user_id:
            refresh_token = request.cookies.get("refresh_token")
            if not refresh_token:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="The refresh token has expired, login again.")

            refresh_payload = jwt.decode(jwt=refresh_token, key=settings.REFRESH_TOKEN_SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id = int(refresh_payload["sub"])

        user = await execute_query("SELECT * FROM users WHERE id = %s", (user_id))

        access_payload = {
            "id": user[0]["id"],
            "username": user[0]["username"],
            "email": user[0]["email"],
            "profile_image_url": user[0]["profile_image_url"],
            "date": str(user[0]["date"]),
            "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        }

        access_token = jwt.encode(access_payload, settings.ACCESS_TOKEN_SECRET_KEY, settings.ALGORITHM)

        return access_token


    except Exception as e:
        status_code = getattr(e, "status_code", status.HTTP_400_BAD_REQUEST)
        raise HTTPException(status_code=status_code, detail=f"{e}")

async def decode_access_token(access_token: str) -> User:
    """
    Decode the access token.
    Create a new access token, if the access token expired.
    Returns the user's data and the access token if created.
    """
    try:
        payload = jwt.decode(access_token, settings.ACCESS_TOKEN_SECRET_KEY, [settings.ALGORITHM])
        payload.pop("exp")

        return payload


    except jwt.ExpiredSignatureError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="The access token expired")
    except jwt.InvalidTokenError as e:
        status_code = getattr(e, "status_code", status.HTTP_401_UNAUTHORIZED)
        raise HTTPException(status_code=status_code, detail=f"{e}")
    except Exception as e:
        status_code = getattr(e, "status_code", status.HTTP_401_UNAUTHORIZED)
        raise HTTPException(status_code=status_code, detail=f"{e}")




