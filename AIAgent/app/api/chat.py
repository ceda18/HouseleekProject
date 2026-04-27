from fastapi import APIRouter, Depends
from app.core.security import verify_api_key
from app.models.chat import ChatRequest, ChatResponse
from app.models.context import SystemContext
from app.agent import claude_client

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/start", dependencies=[Depends(verify_api_key)])
async def start_chat(context: SystemContext):
    """
    Receives the user's snapshot from CorePlatform and stores it in memory.
    Called once when the user opens the chat.
    """
    claude_client.init_session(context.user_id, context.snapshot)
    return {"status": "session initialized"}


@router.post("/message", dependencies=[Depends(verify_api_key)])
async def send_message(request: ChatRequest) -> ChatResponse:
    """
    Processes a single user message.
    Runs the Claude tool-use loop and returns the agent's response.
    """
    return await claude_client.invoke(request.user_id, request.message, request.history)
