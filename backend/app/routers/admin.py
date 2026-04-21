from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.deps import CurrentUser, require_admin

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
async def list_users(_: Annotated[CurrentUser, Depends(require_admin)]) -> dict[str, list[object]]:
    return {"items": []}


@router.get("/users/{user_id}")
async def get_user(user_id: str, _: Annotated[CurrentUser, Depends(require_admin)]) -> dict[str, str]:
    return {"user_id": user_id}


@router.get("/videos")
async def list_videos(_: Annotated[CurrentUser, Depends(require_admin)]) -> dict[str, list[object]]:
    return {"items": []}


@router.patch("/videos/{video_id}/approve")
async def approve_video(video_id: str, _: Annotated[CurrentUser, Depends(require_admin)]) -> dict[str, str]:
    return {"video_id": video_id, "status": "APPROVED"}


@router.patch("/videos/{video_id}/reject")
async def reject_video(video_id: str, _: Annotated[CurrentUser, Depends(require_admin)]) -> dict[str, str]:
    return {"video_id": video_id, "status": "REJECTED"}
