#!/bin/bash
# Houseleek — Start all services in separate Terminal windows

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Sanity checks ─────────────────────────────────────────────────────────────
if [ ! -f "$SCRIPT_DIR/CorePlatform/appsettings.json" ]; then
  echo "✗  appsettings.json not found. Run ./setup.sh first."
  exit 1
fi
if [ ! -f "$SCRIPT_DIR/AIAgent/.env" ]; then
  echo "✗  AIAgent/.env not found. Run ./setup.sh first."
  exit 1
fi
if [ ! -d "$SCRIPT_DIR/WebApp/node_modules" ]; then
  echo "✗  node_modules not found. Run ./setup.sh first."
  exit 1
fi

echo ""
echo "  Houseleek — Starting services..."
echo ""

# ── Open three Terminal windows ───────────────────────────────────────────────

# CorePlatform (ASP.NET Core)
osascript -e "
  tell application \"Terminal\"
    do script \"echo '── CorePlatform ──' && cd '$SCRIPT_DIR/CorePlatform' && dotnet run\"
    set the custom title of front window to \"Houseleek — CorePlatform\"
  end tell"

sleep 0.5

# AIAgent (FastAPI) — use venv if available, otherwise system python
if [ -d "$SCRIPT_DIR/AIAgent/.venv" ]; then
  AGENT_CMD="source .venv/bin/activate && python3 -m uvicorn main:app --reload --port 8000"
else
  AGENT_CMD="python3 -m uvicorn main:app --reload --port 8000"
fi

osascript -e "
  tell application \"Terminal\"
    do script \"echo '── AIAgent ──' && cd '$SCRIPT_DIR/AIAgent' && $AGENT_CMD\"
    set the custom title of front window to \"Houseleek — AIAgent\"
  end tell"

sleep 0.5

# WebApp (Vite)
osascript -e "
  tell application \"Terminal\"
    do script \"echo '── WebApp ──' && cd '$SCRIPT_DIR/WebApp' && npm run dev\"
    set the custom title of front window to \"Houseleek — WebApp\"
  end tell"

echo "  ✓  Three terminals opened:"
echo ""
echo "     CorePlatform  →  http://localhost:5071"
echo "     AIAgent       →  http://localhost:8000"
echo "     WebApp        →  http://localhost:3000"
echo ""
echo "  API docs: http://localhost:5071/scalar/v1"
echo ""
