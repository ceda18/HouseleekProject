"""
Tool definitions passed to Claude.
Each tool corresponds to a capability the agent can invoke during a conversation turn.
"""

EXECUTE_ANALYTICS_QUERY: dict = {
    "name": "execute_analytics_query",
    "description": (
        "Executes a read-only SQL SELECT query against the Houseleek PostgreSQL database "
        "to retrieve analytics data — action logs, item state history, workflow executions, etc. "
        "Only SELECT statements are permitted. The schema is 'houseleek'."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "sql": {
                "type": "string",
                "description": "A valid PostgreSQL SELECT query targeting the houseleek schema."
            }
        },
        "required": ["sql"]
    }
}

CREATE_PROPOSAL: dict = {
    "name": "create_proposal",
    "description": (
        "Creates a structured proposal for adding a new Scene, Automation, or Item. "
        "Use this when the user asks you to suggest or configure a smart home entity. "
        "The payload must exactly match the CorePlatform DTO for the given type."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "type": {
                "type": "string",
                "enum": ["scene", "automation", "item"],
                "description": "The type of entity to propose."
            },
            "payload": {
                "type": "object",
                "description": (
                    "The complete creation payload. "
                    "For 'scene': { name, smartActions: [{ itemStateId, value }] }. "
                    "For 'automation': { name, smartActions: [{ itemStateId, value }], "
                    "triggers: [{ triggerType, valueType, value, operand, itemStateId }] }. "
                    "For 'item': { name, roomId, itemModelId }."
                )
            }
        },
        "required": ["type", "payload"]
    }
}

TOOLS: list[dict] = [EXECUTE_ANALYTICS_QUERY, CREATE_PROPOSAL]
