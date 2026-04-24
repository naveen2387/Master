from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "AI-HRMS"
    VERSION: str = "1.0.0"
    SECRET_KEY: str = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    DATABASE_URL: str = "sqlite:///./hrms.db"
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
