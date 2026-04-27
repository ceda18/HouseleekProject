from fastapi import Header, HTTPException, status
from app.core.config import settings


async def verify_api_key(x_agent_api_key: str = Header(...)):
    if x_agent_api_key != settings.agent_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key."
        )
