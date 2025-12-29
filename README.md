# Spur Shop AI

A customer support chat agent I built using OpenAI and Socket.io. Streams responses in real-time, keeps track of conversation history, and has an admin panel for viewing logs.

## Running it locally

You'll need Node 18+ and Redis running.

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd spur
```

### 2. Start Redis
```bash
redis-server
```

### 3. Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your OpenAI key
npm run dev
```
Runs on http://localhost:3001

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173

---

## Database

Using SQLite with Drizzle ORM. Migrations run automatically on startup, but you can also run them manually:

```bash
cd backend
npm run db:migrate    # run migrations
npm run db:seed       # add some test data
```

---

## Env vars

Copy `backend/.env.example` to `backend/.env` and fill in:

**Required:**
- `OPENAI_API_KEY` — your OpenAI key
- `JWT_SECRET` — any random string for signing tokens
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — credentials for the admin panel

**Optional:**
- `REDIS_URL` — defaults to localhost
- `PORT` — defaults to 3001

---

## How it's structured

Tried to keep things organized with a rough hexagonal architecture:

```
backend/src/
├── api/          # routes, socket handlers, middleware
├── core/         # business logic (chat service, etc)
├── infrastructure/   # DB, Redis, OpenAI wrappers
└── config/       # env config, FAQ data
```

The idea is that `core/` doesn't know about Express or Socket.io — it just defines what the app does. The `api/` layer handles HTTP/WebSocket stuff and calls into core. `infrastructure/` handles external services.

I'm using Socket.io for the chat (streams responses as they come in) and Express for the admin REST endpoints.

---

## LLM stuff

**Model:** GPT-4o-mini — fast enough for chat, cheap enough to not worry about costs during development.

**Prompting approach:**
- There's a system prompt that tells the AI it's a support agent for "Spur Shop"
- I inject FAQ/policy info from `src/config/faq.ts` so it doesn't make up shipping times or return policies
- Last N messages from the conversation get included for context

Nothing fancy, but it works well for a support use case.

---

## Trade-offs & what I'd do with more time

Had to cut corners to ship this. Here's what I'd fix:

| Thing | What I did | Reality |
| :--- | :--- | :--- |
| DB | SQLite | Works, but not gonna scale horizontally |
| Auth | Basic JWT | Fine for a demo, wouldn't use in prod |
| Rate limiting | In-memory | Resets on restart, doesn't work with multiple servers |
| Logging | console.log | Good luck debugging this in prod |

**If I had more time:**

- **Observability** — I'd add tracing (OpenTelemetry) and ship logs somewhere useful. Right now if the LLM call takes 10 seconds I have no idea why.

- **Tests** — There's basic unit tests but no E2E. Want to add Playwright tests for the actual chat flow.

- **Better RAG** — The FAQ injection is pretty dumb. Would be nice to embed docs in a vector DB and do proper semantic search.

- **Scaling** — Right now it's one server. For multiple instances I'd need sticky sessions for Socket.io and move session state to Redis.

- **DX** — Little stuff like a Makefile, better seed data, maybe auto-generate API types.

---

MIT
