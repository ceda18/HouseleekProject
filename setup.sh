#!/bin/bash
# Houseleek — First-time setup script
set -e

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'

ok()   { echo -e "${GREEN}  ✓${NC}  $1"; }
info() { echo -e "${BLUE}  →${NC}  $1"; }
warn() { echo -e "${YELLOW}  ⚠${NC}  $1"; }
fail() { echo -e "${RED}  ✗  $1${NC}"; exit 1; }
step() { echo -e "\n${BOLD}$1${NC}"; echo "──────────────────────────────────────────"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo -e "${BOLD}  Houseleek — Setup${NC}"
echo "  ══════════════════════════════════════════"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# 1. CHECK PREREQUISITES
# ─────────────────────────────────────────────────────────────────────────────
step "1/6  Checking prerequisites"

# PostgreSQL
if ! command -v psql &>/dev/null; then
  fail "PostgreSQL not found. Install it from https://www.postgresql.org/download/ and try again."
fi
ok "PostgreSQL: $(psql --version | awk '{print $3}')"

# .NET 10
if ! command -v dotnet &>/dev/null; then
  fail ".NET SDK not found. Install .NET 10 from https://dotnet.microsoft.com/download and try again."
fi
DOTNET_VER=$(dotnet --version)
DOTNET_MAJOR=$(echo "$DOTNET_VER" | cut -d. -f1)
if [ "$DOTNET_MAJOR" -lt 10 ]; then
  fail ".NET 10+ required (found $DOTNET_VER). Download from https://dotnet.microsoft.com/download"
fi
ok ".NET SDK: $DOTNET_VER"

# Python 3.11+
if ! command -v python3 &>/dev/null; then
  fail "Python 3 not found. Install Python 3.11+ from https://www.python.org/downloads/"
fi
PYTHON_VER=$(python3 --version | awk '{print $2}')
PYTHON_MINOR=$(echo "$PYTHON_VER" | cut -d. -f2)
if [ "$(echo "$PYTHON_VER" | cut -d. -f1)" -lt 3 ] || [ "$PYTHON_MINOR" -lt 11 ]; then
  fail "Python 3.11+ required (found $PYTHON_VER)."
fi
ok "Python: $PYTHON_VER"

# Node.js 18+
if ! command -v node &>/dev/null; then
  fail "Node.js not found. Install Node.js 18+ from https://nodejs.org/"
fi
NODE_VER=$(node --version | tr -d 'v')
NODE_MAJOR=$(echo "$NODE_VER" | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
  fail "Node.js 18+ required (found $NODE_VER)."
fi
ok "Node.js: $NODE_VER"

if ! command -v npm &>/dev/null; then
  fail "npm not found. It should come with Node.js."
fi
ok "npm: $(npm --version)"

# ─────────────────────────────────────────────────────────────────────────────
# 2. POSTGRESQL — create users, database, run schema + seed
# ─────────────────────────────────────────────────────────────────────────────
step "2/6  Setting up PostgreSQL"

# Detect superuser
PG_SUPERUSER=""
info "Detecting PostgreSQL superuser..."
if psql -U "$(whoami)" -c '\q' postgres 2>/dev/null; then
  PG_SUPERUSER="$(whoami)"
  ok "Using superuser: $PG_SUPERUSER"
elif psql -U postgres -c '\q' 2>/dev/null; then
  PG_SUPERUSER="postgres"
  ok "Using superuser: postgres"
else
  echo ""
  echo -e "  ${YELLOW}Could not auto-detect PostgreSQL superuser.${NC}"
  read -rp "  Enter your PostgreSQL superuser name: " PG_SUPERUSER
  if ! psql -U "$PG_SUPERUSER" -c '\q' 2>/dev/null; then
    fail "Cannot connect to PostgreSQL as '$PG_SUPERUSER'. Check that PostgreSQL is running."
  fi
  ok "Using superuser: $PG_SUPERUSER"
fi

# Create roles (ignore if already exist)
info "Creating database users..."
psql -U "$PG_SUPERUSER" postgres <<'SQL' 2>/dev/null || true
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'thesis_core_platform') THEN
    CREATE ROLE thesis_core_platform WITH LOGIN PASSWORD 'password';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'thesis_agent') THEN
    CREATE ROLE thesis_agent WITH LOGIN PASSWORD 'password';
  END IF;
END$$;
SQL
ok "DB users ready (thesis_core_platform, thesis_agent)"

# Create database (ignore if exists)
info "Creating database thesis_project..."
psql -U "$PG_SUPERUSER" postgres -c "CREATE DATABASE thesis_project OWNER thesis_core_platform;" 2>/dev/null || true
ok "Database ready"

# Run schema.sql
info "Running schema.sql..."
psql -U "$PG_SUPERUSER" -d thesis_project -f "$SCRIPT_DIR/Database/schema.sql" > /dev/null
ok "Schema applied"

# Generate seed
info "Generating seed data (seed.py)..."
cd "$SCRIPT_DIR/Database"
python3 seed.py > /dev/null
ok "seed.sql generated ($(wc -l < seed.sql | tr -d ' ') lines)"

info "Importing seed data..."
psql -U "$PG_SUPERUSER" -d thesis_project -f "$SCRIPT_DIR/Database/seed.sql" > /dev/null
ok "Seed data imported"
cd "$SCRIPT_DIR"

# ─────────────────────────────────────────────────────────────────────────────
# 3. CONFIGURE CorePlatform
# ─────────────────────────────────────────────────────────────────────────────
step "3/6  Configuring CorePlatform"

APPSETTINGS="$SCRIPT_DIR/CorePlatform/appsettings.json"
APPSETTINGS_EXAMPLE="$SCRIPT_DIR/CorePlatform/appsettings.example.json"

if [ -f "$APPSETTINGS" ]; then
  warn "appsettings.json already exists — skipping (delete it and re-run setup to reset)"
else
  cp "$APPSETTINGS_EXAMPLE" "$APPSETTINGS"
  ok "appsettings.json created from example"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 4. CONFIGURE AIAgent
# ─────────────────────────────────────────────────────────────────────────────
step "4/6  Configuring AIAgent"

ENV_FILE="$SCRIPT_DIR/AIAgent/.env"
ENV_EXAMPLE="$SCRIPT_DIR/AIAgent/.env.example"

# Generate a shared API key for CorePlatform ↔ AIAgent communication
AGENT_API_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")

if [ -f "$ENV_FILE" ]; then
  warn ".env already exists — skipping (delete it and re-run setup to reset)"
else
  # Prompt for Anthropic API key
  echo ""
  echo -e "  ${BOLD}Anthropic API key required for the AI Agent.${NC}"
  echo -e "  Get yours at: ${BLUE}https://console.anthropic.com/${NC}"
  echo ""
  read -rp "  Paste your ANTHROPIC_API_KEY: " ANTHROPIC_KEY
  echo ""

  if [ -z "$ANTHROPIC_KEY" ]; then
    warn "No API key entered — you can add it later in AIAgent/.env"
    ANTHROPIC_KEY="your-anthropic-api-key-here"
  fi

  cp "$ENV_EXAMPLE" "$ENV_FILE"
  sed -i '' "s|your-anthropic-api-key-here|$ANTHROPIC_KEY|" "$ENV_FILE"
  sed -i '' "s|your-secret-agent-api-key-here|$AGENT_API_KEY|" "$ENV_FILE"
  ok ".env created"

  # Write the same agent key to appsettings.json
  sed -i '' "s|your-secret-agent-api-key-here|$AGENT_API_KEY|" "$APPSETTINGS" 2>/dev/null || true
  ok "Agent API key synced to appsettings.json"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 5. INSTALL PYTHON DEPENDENCIES
# ─────────────────────────────────────────────────────────────────────────────
step "5/6  Installing Python dependencies"

cd "$SCRIPT_DIR/AIAgent"
if [ ! -d ".venv" ]; then
  info "Creating virtual environment..."
  python3 -m venv .venv
fi
info "Installing packages..."
.venv/bin/pip install -q -r requirements.txt
ok "Python dependencies installed"
cd "$SCRIPT_DIR"

# ─────────────────────────────────────────────────────────────────────────────
# 6. INSTALL NODE DEPENDENCIES
# ─────────────────────────────────────────────────────────────────────────────
step "6/6  Installing Node.js dependencies"

cd "$SCRIPT_DIR/WebApp"
info "Running npm install..."
npm install --silent
ok "Node dependencies installed"
cd "$SCRIPT_DIR"

# ─────────────────────────────────────────────────────────────────────────────
# DONE
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}  ✓  Setup complete!${NC}"
echo ""
echo "  Test user:  pera.peric@gmail.com  /  lozinka123"
echo ""
echo -e "  Run ${BOLD}./run.sh${NC} to start all three services."
echo ""
