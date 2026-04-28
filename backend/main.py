from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.routers import (
    admin,
    auth,
    dictionary,
    lessons,
    practice,
    quiz,
    spelling,
    sync,
    units,
    user,
)


def create_app() -> FastAPI:
    app = FastAPI(title="KSL Learning Platform API", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Mount local media for localhost development
    if settings.use_local_media:
        media_path = Path(settings.local_media_path)
        if media_path.exists():
            app.mount("/media", StaticFiles(directory=str(media_path)), name="media")
    
    app.include_router(auth.router)
    app.include_router(units.router)
    app.include_router(lessons.router)
    app.include_router(quiz.router)
    app.include_router(spelling.router)
    app.include_router(practice.router)
    app.include_router(dictionary.router)
    app.include_router(user.router)
    app.include_router(sync.router)
    app.include_router(admin.router)
    
    @app.get("/")
    async def root():
        return {
            "title": "KSL Learning Platform API",
            "version": "0.1.0",
            "environment": settings.app_env,
            "media_base_url": settings.media_base_url,
            "using_local_media": settings.use_local_media,
        }
    
    return app


app = create_app()
