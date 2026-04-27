"""
HTTP client for calling CorePlatform endpoints.
All requests are authenticated with the shared API key.
"""

import httpx
from app.core.config import settings
from typing import Union

_HEADERS = {"X-Agent-Api-Key": settings.agent_api_key}


async def post(path: str, body: dict) -> Union[dict, list, str]:
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.post(
            f"{settings.core_platform_url}{path}",
            json=body,
            headers=_HEADERS,
            timeout=30.0,
        )
        if not response.is_success:
            return {"error": response.text}
        return response.json()
