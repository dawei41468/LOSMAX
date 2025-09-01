import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Determine the environment and set the appropriate .env file path
app_env = os.getenv('APP_ENV', 'development')
env_file_path = Path(__file__).parent.parent

if app_env == 'production':
    env_file = env_file_path / ".env.production"
else:
    # Default to .env.development if not in production
    env_file = env_file_path / ".env.development"

class Settings(BaseSettings):
    MONGODB_URL: str = ""  # Will be loaded from env
    SECRET_KEY: str = ""  # Will be loaded from env
    REFRESH_SECRET_KEY: str = ""  # Will be loaded from env
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    REFRESH_TOKEN_ROTATION: bool = True
    ALGORITHM: str = "HS256"

    model_config = SettingsConfigDict(
        env_file=env_file,
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()