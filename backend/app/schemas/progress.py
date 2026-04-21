from pydantic import BaseModel, Field


class CompletionRequest(BaseModel):
    score: float = Field(ge=0, le=100)
    stars: int = Field(ge=0, le=5)
