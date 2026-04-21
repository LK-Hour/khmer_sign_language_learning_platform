from fastapi import APIRouter, Query

router = APIRouter(prefix="/dictionary", tags=["dictionary"])


@router.get("")
async def get_dictionary(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    track: str | None = Query(default=None),
) -> dict[str, object]:
    return {
        "page": page,
        "limit": limit,
        "track": track,
        "items": [],
    }


@router.get("/{sign_id}")
async def get_dictionary_entry(sign_id: str) -> dict[str, str]:
    return {"sign_id": sign_id, "message": "Dictionary detail endpoint scaffolded"}
