# BD Navigator – Express API Server

Self-hosted backend for BD Navigator, running on Node.js with SQLite.

## Requirements

- **Node.js 18+** (required for built-in `fetch`)
- Windows IIS with [iisnode](https://github.com/Azure/iisnode) (for production)

## Quick Start

```bash
npm install
node index.js
```

Server runs on port 3001 (or `PORT` env var).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 3001, ignored by iisnode) |
| `DB_PATH` | No | Path to SQLite database (default: `./BDNavigator.db`) |
| `UPLOAD_DIR` | No | File upload directory (default: `./uploads`) |
| `OPENAI_API_KEY` | For AI | OpenAI API key for IDA assessments & estimations |
| `AI_BASE_URL` | No | Override AI endpoint (default: `https://api.openai.com/v1/chat/completions`) |
| `AI_MODEL` | No | Override AI model (default: `gpt-4o-mini`) |
| `PERPLEXITY_API_KEY` | For AI | Perplexity API key for Mark web research |

## AI Proxy Routes

These routes replace the Supabase Edge Functions for self-hosted deployments:

| Route | Agent | Description |
|---|---|---|
| `POST /api/ai-assessment` | IDA | Idea scoring assessment |
| `POST /api/business-case-assessment` | IDA | Financial / business case assessment |
| `POST /api/mark-web-research` | Mark | Web research (PESTEL, Porter, TAM, Competitor) |
| `POST /api/tam-estimation` | IDA | TAM market sizing (3 scenarios) |
| `POST /api/sam-estimation` | IDA | SAM market sizing (3 scenarios) |
| `POST /api/som-estimation` | IDA | SOM market sizing (3 scenarios) |

### Using a different AI provider

Set `AI_BASE_URL` to any OpenAI-compatible endpoint:

```bash
# Azure OpenAI
AI_BASE_URL=https://my-resource.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-01

# Local LLM (Ollama, LM Studio, etc.)
AI_BASE_URL=http://localhost:11434/v1/chat/completions
AI_MODEL=llama3

# Anthropic via proxy
AI_BASE_URL=https://my-proxy.example.com/v1/chat/completions
```

## Data Routes

| Route | Method | Description |
|---|---|---|
| `/api/opportunities` | GET, POST | List / create opportunities |
| `/api/opportunities/:id` | GET, PUT, DELETE | Read / update / delete opportunity |
| `/api/ai-assessments` | GET, POST | List / create AI assessments |
| `/api/ai-assessments/:id` | PUT, DELETE | Update / delete assessment |
| `/api/opportunity-files` | GET, POST | List / upload files |
| `/api/opportunity-files/:id` | PATCH, DELETE | Update comment / delete file |
| `/api/health` | GET | Health check |
