from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
    return app


app = create_app()
