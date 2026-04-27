from fastapi import APIRouter
from app.api.chat import router as chat_router
from app.api.session import router as session_router

router = APIRouter()
router.include_router(chat_router)
router.include_router(session_router)
