from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # DB settings
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str

    # jwt settings
    ACCESS_TOKEN_SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int | float
    ALGORITHM: str
    REFRESH_TOKEN_SECRET_KEY: str
    REFRESH_TOKEN_EXPIRE_DAYS: int



    model_config = SettingsConfigDict(
        env_file = ".env",
    )


settings = Settings()