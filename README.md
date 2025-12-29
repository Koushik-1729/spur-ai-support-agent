# Spur Shop AI

Chat support bot. Uses OpenAI for responses, Socket.io for streaming. Has an admin panel too.

## Setup

Need Node 18+ and Redis.

```bash
# clone it
git clone <your-repo-url>
cd spur

# start redis
redis-server

# backend (in one terminal)
cd backend
npm install
cp .env.example .env   # add your OpenAI key here
npm run dev            # runs on :3001

# frontend (in another terminal)
cd frontend
npm install
npm run dev            # runs on :5173
```

## Database

SQLite + Drizzle. Migrations run on startup. If you need to run them manually:

```bash
cd backend
npm run db:migrate
npm run db:seed   # optional, adds test data
```

## Environment

Edit `backend/.env`:

```
OPENAI_API_KEY=sk-...        # required
JWT_SECRET=whatever          # required, just make something up
ADMIN_EMAIL=admin@test.com   # required
ADMIN_PASSWORD=password123   # required
REDIS_URL=                   # optional, defaults to localhost
```

## Project structure

```
backend/src/
├── api/            # express routes, socket handlers
├── application/    # use cases
├── domain/         # interfaces, entities
├── infrastructure/ # openai, sqlite, redis adapters
└── config/         # env vars, prompts, logger
```

Hexagonal-ish architecture. Domain layer defines interfaces, infrastructure implements them. API layer just wires everything together.

## Running tests

```bash
cd backend
npm test
```

## How the AI works

Using GPT-4o-mini. System prompt tells it to be a support agent for "Spur Shop". FAQ content from `config/faq.ts` gets injected so it knows shipping policies etc. Conversation history (last N messages) included for context.

## What I'd improve

| Area | Current | Problem |
|------|---------|---------|
| DB | SQLite | Single file, can't scale horizontally |
| Auth | Basic JWT | No real user management |
| Rate limits | In-memory | Lost on restart |

Given more time:
- Add tracing so I can see why LLM calls are slow
- E2E tests with Playwright
- Vector DB for better context retrieval
- Proper horizontal scaling with Redis sessions

---

MIT
