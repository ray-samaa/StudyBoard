from aiomysql import create_pool, DictCursor
from app.settings import settings


pool = None

async def get_pool():
    global pool
    if pool is None:
        pool = await create_pool(
            host = settings.DB_HOST,
            port = settings.DB_PORT,
            user = settings.DB_USER,
            password = settings.DB_PASSWORD,
            db = settings.DB_NAME,
            autocommit = True,
            minsize = 1,
            maxsize = 10
        )
    
    return pool

async def execute_query(query: str, params: tuple = ()):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(DictCursor) as cr:
            await cr.execute(query, params)
            if query.strip().upper().startswith("SELECT"):
                return await cr.fetchall()
