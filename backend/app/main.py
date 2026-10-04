from pathlib import Path


from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware



from app.routes.auth import auth_router
from app.routes.tasks import tasks_router
from app.routes.users import users_router

app = FastAPI()

app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)


BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/")
def say_hello():
    return {"message": "Hello there!"}


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(tasks_router)