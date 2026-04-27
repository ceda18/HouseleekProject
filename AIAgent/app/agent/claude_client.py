"""
Core Claude API client.
Manages per-user snapshots and drives the multi-turn tool-use loop.
"""

import anthropic
from app.core.config import settings
from app.agent.tools import TOOLS
from app.agent.prompts import build_system_prompt
from app.models.chat import Message, ChatResponse
from app.models.proposal import ProposalPayload
from app.services.analytics import execute_analytics_query

_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

# In-memory snapshot store: userId → snapshot dict
# Lives as long as the process is running.
_sessions: dict[int, dict] = {}

_MAX_TOOL_ITERATIONS = 10


# ─── SESSION MANAGEMENT ──────────────────────────────────────────────────────

def init_session(user_id: int, snapshot: dict) -> None:
    _sessions[user_id] = snapshot


def clear_session(user_id: int) -> None:
    _sessions.pop(user_id, None)


# ─── INVOCATION ──────────────────────────────────────────────────────────────

async def invoke(user_id: int, message: str, history: list[Message]) -> ChatResponse:
    snapshot = _sessions.get(user_id, {})
    system_prompt = build_system_prompt(snapshot)

    # Build the message list Claude expects
    messages = [{"role": m.role, "content": m.content} for m in history]
    messages.append({"role": "user", "content": message})

    proposal: ProposalPayload | None = None

    for _ in range(_MAX_TOOL_ITERATIONS):
        response = _client.messages.create(
            model=settings.anthropic_model,
            max_tokens=4096,
            system=system_prompt,
            tools=TOOLS,
            messages=messages,
        )

        if response.stop_reason == "end_turn":
            content = _extract_text(response.content)
            return ChatResponse(content=content, proposal=proposal)

        if response.stop_reason == "tool_use":
            tool_results = []

            for block in response.content:
                if block.type != "tool_use":
                    continue

                if block.name == "execute_analytics_query":
                    result = await execute_analytics_query(block.input["sql"])
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": str(result),
                    })

                elif block.name == "create_proposal":
                    proposal = ProposalPayload(
                        type=block.input["type"],
                        payload=block.input["payload"],
                    )
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": "Proposal created successfully.",
                    })

            # Append assistant turn (with tool_use blocks) and tool results
            messages.append({"role": "assistant", "content": response.content})
            messages.append({"role": "user", "content": tool_results})

        else:
            break

    return ChatResponse(content="Could not complete the request.", proposal=proposal)


# ─── HELPERS ─────────────────────────────────────────────────────────────────

def _extract_text(content_blocks) -> str:
    return " ".join(
        block.text for block in content_blocks if hasattr(block, "text")
    ).strip()
