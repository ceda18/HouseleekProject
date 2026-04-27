from pydantic import BaseModel
from enum import Enum
from typing import Any


class ProposalType(str, Enum):
    SCENE = "scene"
    AUTOMATION = "automation"
    ITEM = "item"


class ProposalPayload(BaseModel):
    type: ProposalType
    payload: dict[str, Any]
