from pydantic import BaseModel
from typing import Any


class SystemContext(BaseModel):
    user_id: int
    snapshot: dict[str, Any]
