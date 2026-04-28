from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_env: str = "development"
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5433/ksl"
    media_base_url: str = "http://localhost:8000/media"  # ← Default to localhost
    jwt_secret_key: str = "change-this-secret"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 15
    refresh_token_days: int = 7
    google_client_id: str | None = None
    cors_allow_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://127.0.0.1:3000"]
    )
    # Localhost dev data paths
    local_media_path: str = "../data_set"  # Relative to backend/
    use_local_media: bool = True  # Set to False for production (use CDN)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

# Resolve local media path for localhost development
if settings.use_local_media:
    settings.local_media_path = str(
        (Path(__file__).parent.parent.parent / settings.local_media_path).resolve()
    )
