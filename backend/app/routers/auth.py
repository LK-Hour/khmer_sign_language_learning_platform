import uuid
import json
from typing import Annotated
from urllib.error import URLError
from urllib.request import urlopen

from authlib.jose import jwt
from authlib.jose.errors import JoseError
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.db.session import get_db_session
from app.models.user import User, UserStats, UserRole
from app.schemas.auth import GoogleAuthRequest, LoginRequest, RefreshRequest, RegisterRequest, TokenResponse
from app.schemas.common import MessageResponse

router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs"
GOOGLE_ISSUERS = {"https://accounts.google.com", "accounts.google.com"}


def _decode_google_id_token(id_token: str) -> tuple[str, str]:
    try:
        with urlopen(GOOGLE_JWKS_URL, timeout=5) as response:
            jwks = json.loads(response.read().decode("utf-8"))
    except (URLError, json.JSONDecodeError) as exc:
        raise ValueError("Unable to validate Google token") from exc

    try:
        claims = jwt.decode(id_token, jwks)
        claims.validate()
    except JoseError as exc:
        raise ValueError("Invalid Google token") from exc

    issuer = claims.get("iss")
    if issuer not in GOOGLE_ISSUERS:
        raise ValueError("Invalid Google issuer")

    audience = claims.get("aud")
    if settings.google_client_id and audience != settings.google_client_id:
        raise ValueError("Google audience mismatch")

    email = claims.get("email")
    if not email:
        raise ValueError("Google account email is missing")
    if claims.get("email_verified") is False:
        raise ValueError("Google account email is not verified")

    display_name = claims.get("name") or email.split("@")[0]
    return str(email).lower(), str(display_name)


@router.post("/register", response_model=TokenResponse)
async def register(
    payload: RegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> TokenResponse:
    existing_user = await db.scalar(select(User).where(User.email == payload.email))
    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        display_name=payload.display_name,
        role=UserRole.LEARNER,
        timezone=payload.timezone,
        consent_for_video_contribution=False,
    )
    db.add(user)
    await db.flush()

    db.add(
        UserStats(
            user_id=user.id,
            current_streak=0,
            longest_streak=0,
            total_xp=0,
            badges_json="[]",
        )
    )
    await db.commit()

    claims = {"role": user.role.value, "timezone": user.timezone}
    return TokenResponse(
        access_token=create_access_token(str(user.id), claims),
        refresh_token=create_refresh_token(str(user.id), claims),
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> TokenResponse:
    user = await db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    claims = {"role": user.role.value, "timezone": user.timezone}
    return TokenResponse(
        access_token=create_access_token(str(user.id), claims),
        refresh_token=create_refresh_token(str(user.id), claims),
    )


@router.post("/google", response_model=TokenResponse)
async def google_oauth(
    payload: GoogleAuthRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> TokenResponse:
    try:
        email, display_name = _decode_google_id_token(payload.id_token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    user = await db.scalar(select(User).where(User.email == email))
    if user is None:
        # Google-only account in MVP keeps placeholder password hash.
        user = User(
            email=email,
            password_hash=hash_password(str(uuid.uuid4())),
            display_name=display_name,
            role=UserRole.LEARNER,
            timezone="Asia/Phnom_Penh",
            consent_for_video_contribution=False,
        )
        db.add(user)
        await db.flush()
        db.add(
            UserStats(
                user_id=user.id,
                current_streak=0,
                longest_streak=0,
                total_xp=0,
                badges_json="[]",
            )
        )
    else:
        user.display_name = display_name

    await db.commit()
    claims = {"role": user.role.value, "timezone": user.timezone}
    return TokenResponse(
        access_token=create_access_token(str(user.id), claims),
        refresh_token=create_refresh_token(str(user.id), claims),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    payload: RefreshRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> TokenResponse:
    decoded = decode_token(payload.refresh_token)
    if decoded.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    subject = decoded.get("sub")
    if subject is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    try:
        user_uuid = uuid.UUID(subject)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token") from exc

    user = await db.scalar(select(User).where(User.id == user_uuid))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    claims = {"role": user.role.value, "timezone": user.timezone}
    return TokenResponse(
        access_token=create_access_token(str(user.id), claims),
        refresh_token=create_refresh_token(str(user.id), claims),
    )


@router.post("/logout", response_model=MessageResponse)
async def logout() -> MessageResponse:
    return MessageResponse(message="Logged out")
