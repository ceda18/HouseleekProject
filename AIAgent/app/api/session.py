from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.security import verify_api_key
from app.agent import claude_client

router = APIRouter(prefix="/session", tags=["session"])


class ClearRequest(BaseModel):
    user_id: int


@router.post("/clear", dependencies=[Depends(verify_api_key)])
async def clear_session(request: ClearRequest):
    """
    Removes the user's snapshot from agent memory.
    Called by CorePlatform when the user starts a new chat.
    """
    claude_client.clear_session(request.user_id)
    return {"status": "session cleared"}
