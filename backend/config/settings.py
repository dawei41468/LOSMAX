from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    MONGODB_URL: str
    SECRET_KEY: str
    REFRESH_SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    REFRESH_TOKEN_ROTATION: bool = True
    ALGORITHM: str = "HS256"
    
    class Config:
        env_file_path = Path(__file__).parent.parent
        env_file = env_file_path / ".env"
        env_file_encoding = "utf-8"

        @classmethod
        def customise_sources(
            cls,
            init_settings,
            env_settings,
            dotenv_settings,
            file_secret_settings,
        ):
            from pydantic_settings import SettingsConfigDict
            import os

            app_env = os.getenv('APP_ENV', 'development')
            if app_env == 'production':
                dotenv_settings = SettingsConfigDict(env_file=cls.env_file_path / ".env.production", env_file_encoding="utf-8")
            else:
                dotenv_settings = SettingsConfigDict(env_file=cls.env_file_path / ".env.development", env_file_encoding="utf-8")

            return (
                init_settings,
                env_settings,
                dotenv_settings,
                file_secret_settings,
            )

settings = Settings()