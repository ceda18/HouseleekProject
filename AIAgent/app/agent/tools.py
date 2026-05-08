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
                    "The complete creation payload — keys MUST be camelCase, matching the "
                    "CorePlatform DTOs that the frontend uses. Examples:\n"
                    "  scene:      { name, smartActions: [{ itemStateId, value }] }\n"
                    "  automation: { name, "
                    "smartActions: [{ itemStateId, value }] (use { targetSceneId } for scene actions), "
                    "triggers: [{ triggerType, valueType, value, operand, itemStateId }] (triggerType must be either 'state-driven' or 'time-driven') }\n"
                    "  item:       { name, roomId, itemModelId, itemModelName, itemCategoryName }\n"
                    "Only use itemStateId / roomId / itemModelId values from the snapshot. "
                    "For 'item', look up itemModelName and itemCategoryName from the snapshot's "
                    "itemModels / categories so the preview can render meaningful labels."
                )
            }
        },
        "required": ["type", "payload"]
    }
}

GET_CATALOG: dict = {
    "name": "get_catalog",
    "description": (
        "Fetches the full list of available device models from the catalog. "
        "Use this ONLY when the user asks to add a new device or wants to know "
        "what device models are available. Returns itemModelId, name, category, and vendor "
        "for each model — use these values when building an 'item' proposal payload."
    ),
    "input_schema": {
        "type": "object",
        "properties": {},
        "required": []
    }
}

TOOLS: list[dict] = [EXECUTE_ANALYTICS_QUERY, GET_CATALOG, CREATE_PROPOSAL]
