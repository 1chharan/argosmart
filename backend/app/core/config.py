import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "AgroSmart AI: Pollinator & Beneficial Insect Network"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "agrosmart-secret-key-super-secure-hackathon-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./agrosmart.db")
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ]
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", "./uploads")

settings = Settings()
