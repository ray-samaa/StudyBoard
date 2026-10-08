import truststore

truststore.inject_into_ssl()





from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware



from app.routes.auth import auth_router
from app.routes.tasks import tasks_router
from app.routes.users import users_router

app = FastAPI()

app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://study-board-red.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)


@app.get("/")
async def say_hello():
    return {"message": "Hello there!"}



app.include_router(auth_router)
app.include_router(users_router)
app.include_router(tasks_router)