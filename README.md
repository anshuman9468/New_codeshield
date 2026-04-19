# 🛡️ CodeShield

AI-Powered Code Debugging & Auto-Fixing System

## Features

- **Code Mode**: Analyze and fix individual code snippets
- **Project Mode**: Scan and fix entire projects automatically
- **AI Analysis**: Powered by Google Gemini API
- **Security First**: Strict access controls and validation with ArmorClaw
- **Multi-Agent System**: Planner and Executor agents for intelligent workflows
- **Beautiful UI**: Clean, modern React frontend
- **ArmorClaw Integration**: Secure intent-aware file access

## Tech Stack

### Backend
- Python 3.9+
- FastAPI
- Google Generative AI (Gemini)

### Frontend
- React 18
- Vite
- Modern CSS

## Installation

### 1. Clone or navigate to the project
```bash
cd New_codeshield
```

### 2. Set up environment variables
Copy `.env.example` to `.env` and add your API keys:
```bash
cp .env.example .env
```

Edit `.env` and add:
- `GEMINI_API_KEY`: Get from [Google AI Studio](https://aistudio.google.com/)
- `ARMORCLAW_API_KEY`: Get from [ArmorIQ Platform](https://platform.armoriq.ai)

### 3. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### 4. Install Frontend Dependencies
```bash
cd frontend
npm install
```

## ArmorClaw Setup (Production)

### Prerequisites
- Node.js version 22 or higher
- pnpm package manager
- Git

### Step 1: Create ArmorIQ Account
Go to [https://platform.armoriq.ai](https://platform.armoriq.ai) and sign up.
- Verify your email
- Login to dashboard

### Step 2: Create API Key
- Go to API Keys page
- Click "Create Key"
- Copy the key (starts with `ak_claw_`)

### Step 3: Install ArmorClaw
On Windows, use Git Bash or WSL:
```bash
curl -fsSL https://armoriq.ai/install-armorclaw.sh | bash
```

### Step 4: Configure ArmorClaw
Edit `~/.openclaw/openclaw.json` and add:
```json
{
  "env": {
    "GEMINI_API_KEY": "AIzaSyDlK--d6TtwG_1YywocZBVGE1SAPdSKBJ8"
  },
  "plugins": {
    "entries": {
      "armorclaw": {
        "enabled": true,
        "config": {
          "enabled": true,
          "apiKey": "ak_live_accd8b2681104d6fb231c4127074357cbe8722f49cac151edc7c6dd59bb10689",
          "userId": "chain.chapter.dao@gmail.com",
          "agentId": "codeshield-agent-001",
          "contextId": "default",
          "validitySeconds": 600,
          "iapEndpoint": "https://armorclaw-api.armoriq.ai",
          "backendEndpoint": "https://armorclaw-api.armoriq.ai",
          "proxyEndpoint": "https://armorclaw-api.armoriq.ai",
          "policyUpdateEnabled": true,
          "policyUpdateAllowList": ["*"]
        }
      }
    }
  }
}
```

### Step 5: Start ArmorClaw Gateway
```bash
# Kill any existing instances first
pkill -f "openclaw" 2>/dev/null; sleep 1

# Start gateway in background
cd /home/anshumandutta/openclaw-armoriq && node openclaw.mjs gateway --port 18789 --verbose > /tmp/openclaw-gateway.log 2>&1 &

# Wait ~6 seconds, then verify
sleep 6 && curl http://localhost:18789/healthz
```

## Running the Application

> **Note:** A `.env` file is required. It is pre-configured with your API keys at `New_codeshield/.env`.
> The `armorclaw-venv` Python virtual environment must be activated before running the backend.

### Production Mode (Real ArmorClaw) — Recommended

Use **4 separate terminal tabs/windows**:

#### Terminal 1 — ArmorClaw Gateway
```bash
pkill -f "openclaw" 2>/dev/null; sleep 1
cd /home/anshumandutta/openclaw-armoriq && node openclaw.mjs gateway --port 18789 --verbose > /tmp/openclaw-gateway.log 2>&1 &
sleep 6 && curl http://localhost:18789/healthz
# Then watch logs:
tail -f /tmp/openclaw-gateway.log
```

#### Terminal 2 — Backend Server
```bash
cd /home/anshumandutta/New_codeshield
source armorclaw-venv/bin/activate
python -m backend.server
```
Runs on http://localhost:8000

#### Terminal 3 — Frontend
```bash
cd /home/anshumandutta/New_codeshield/frontend
npm run dev
```
Runs on http://localhost:5173  (open this in your browser)

---

### Local Development Mode (Mock — No Gateway Needed)

#### Terminal 1 — Mock OpenClaw Server
```bash
cd /home/anshumandutta/New_codeshield
source armorclaw-venv/bin/activate
python -m tools.mock_server
```
Runs on port 8001.

#### Terminal 2 — Backend Server
```bash
cd /home/anshumandutta/New_codeshield
source armorclaw-venv/bin/activate
python -m backend.server
```
Runs on port 8000.

#### Terminal 3 — Frontend
```bash
cd /home/anshumandutta/New_codeshield/frontend
npm run dev
```
Runs on http://localhost:5173

---

### Stop Everything
```bash
pkill -f "openclaw"
pkill -f "backend.server"
pkill -f "mock_server"
# Frontend: press Ctrl+C in its terminal
```

---

## Usage

1. Open your browser and go to `http://localhost:3000`
2. Choose between **Code Mode** or **Project Mode**
3. Paste your code or enter a project path
4. Click "Analyze & Fix"
5. Review the results, bugs found, and fixed code!

## Project Structure

```
New_codeshield/
├── backend/
│   ├── __init__.py
│   ├── server.py          # FastAPI server
│   ├── agent.py           # Main CodeShield agent
│   ├── planner.py         # Planning agent
│   ├── executor.py        # Execution agent
│   ├── llm.py             # Gemini API integration
│   ├── security.py        # Security validation
│   └── memory.py          # Memory system
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── tools/
│   ├── openclaw.py        # OpenClaw API integration
│   └── mock_server.py     # Local mock server
├── requirements.txt
├── .env.example
└── README.md
```

## API Endpoints

- `POST /analyze_code` - Analyze a code snippet
- `POST /analyze_project` - Analyze an entire project
- `GET /logs` - Get recent logs
- `GET /health` - Health check

## Security Features

- Strict path validation
- Blocked files (.env, secrets, keys)
- Dangerous command blocking
- Tool call validation before execution
- ArmorClaw intent-aware security (production)

## Troubleshooting

### "Path outside allowed directories"
Add your folder to `self.allowed_base_dirs` in `backend/security.py`

### "Permission denied" writing files
Use the `user/project/` directory which is always writable

### Frontend "ERR_ABORTED"
Clear Vite cache: delete `frontend/node_modules/.vite` and restart

### ArmorClaw "intent token expired"
Set `validitySeconds` to 600 in ArmorClaw config

### Check ArmorClaw health
```bash
curl http://localhost:18789/healthz
```

## License

MIT
