from pydantic import BaseModel
from typing import Optional
from app.models.proposal import ProposalPayload


class Message(BaseModel):
    role: str   # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    user_id: int
    message: str
    history: list[Message]


class ChatResponse(BaseModel):
    content: str
    proposal: Optional[ProposalPayload] = None
