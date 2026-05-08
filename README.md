<img src="WebApp/src/assets/logo-vertical.png" alt="Houseleek" width="160" />
<br>

# Project Houseleek 🏠

Houseleek is a **smart home management system** developed as a graduate thesis, featuring an **AI agent** built on Anthropic Claude for natural language control and analytics of **IoT devices**.

---

> [!IMPORTANT] 
> ✅ If you wanna test the app, you may do that on the following link:
> [houseleek.up.railway.app](https://houseleek.up.railway.app)

> [!IMPORTANT]
> ❗️ Please read the following README.md file carefully if you are looking for running the app locally. Here below is the installation manual for Mac/Linux.

---

> [!NOTE]
> 👉 For a thorough look into this project, peek inside the [final thesis](https://github.com/ceda18/HouseleekProject/blob/main/Final%20Thesis%20-%20%C4%8Ceda%20Veli%C4%8Dkovi%C4%87.pdf) itself. The language used throughout the documentation is Serbian.

---

The system consists of three services that run together:

| Service | Stack | Default URL |
|---|---|---|
| CorePlatform | ASP.NET Core 10 | `http://localhost:5071` |
| AIAgent | Python 3 / FastAPI | `http://localhost:8000` |
| WebApp | React / Vite | `http://localhost:3000` |

API documentation is available at `http://localhost:5071/scalar/v1` when running.

---

## Prerequisites

The following must be installed manually before running setup:

| Requirement | Version | Notes |
|---|---|---|
| [PostgreSQL](https://www.postgresql.org/download/) | 15+ | Must be running locally |
| [.NET SDK](https://dotnet.microsoft.com/download) | **10+** | |
| [Python](https://www.python.org/downloads/) | **3.11+** | |
| [Node.js](https://nodejs.org/) | **18+** | Includes npm |

> **setup.sh** will automatically install Python packages (`pip`) and Node dependencies (`npm install`). It will also create the database, users, schema, and seed data. You do not need to do any of that manually.

---

> [!WARNING]
> **An Anthropic API key is required for the AI Agent to function.**
> Without it the app runs but the AI chat feature will not work.
> Get your key at [console.anthropic.com](https://console.anthropic.com/). You will be prompted to paste it during setup.

---

## Installation

Run once from the project root:

```bash
./setup.sh
```

The script will:
1. Verify all prerequisites are installed
2. Create the PostgreSQL database, users, and schema
3. Generate and import seed data
4. Ask for your **Anthropic API key** and write all config files
5. Install Python and Node.js dependencies

---

## Running

After setup, start all three services with:

```bash
./run.sh
```

This opens three separate Terminal windows, one per service. Wait a few seconds for CorePlatform to finish starting up before using the app.

---

## Test Account

> [!TIP]
> 👤 A test user is always available after seeding:
>
>| Field | Value |
>|---|---|
>| Email | `pera.peric@gmail.com` |
>| Password | `lozinka123` |
>

---

That's about it. Have fun testing the app! 🤙
