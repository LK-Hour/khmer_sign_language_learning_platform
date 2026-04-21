from typing import Annotated
from uuid import UUID, uuid4

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel

from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class CurrentUser(BaseModel):
    id: UUID
    role: str
    timezone: str


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> CurrentUser:
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        subject = payload.get("sub")
        if subject is None:
            raise ValueError("Token subject missing")
        role = payload.get("role", "LEARNER")
        timezone = payload.get("timezone", "Asia/Phnom_Penh")
        user_id = uuid4() if subject == "bootstrap" else UUID(subject)
    except (JWTError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        ) from exc
    return CurrentUser(id=user_id, role=role, timezone=timezone)


def require_admin(user: Annotated[CurrentUser, Depends(get_current_user)]) -> CurrentUser:
    if user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required")
    return user
