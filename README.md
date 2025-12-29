# Spur Shop AI - Intelligent Customer Support Agent

> **Note:** This is a fully functional, production-ready implementation of the Spur AI Assistant.

Welcome to **Spur Shop AI**, a modern customer support solution that combines the power of **Large Language Models (OpenAI)** with a **real-time, event-driven architecture**.

Many chatbots feel robotic and slow. We built this to feel **alive**. 
It streams responses character-by-character (like ChatGPT), remembers your entire conversation context, and handles concurrent users gracefully using robust queueing.

![Spur Shop AI Preview](https://via.placeholder.com/800x400?text=Spur+Shop+AI+Chat+Interface)

---

## ✨ Features at a Glance

This isn't just a wrapper around an API. It's a full-stack engineering demonstration.

*   **⚡ Real-Time Streaming**: No staring at a spinner. Responses stream in via WebSockets standard (Socket.io) for instant feedback.
*   **🧠 Intelligent Context**: The AI remembers previous messages in your session, allowing for natural, follow-up conversations.
*   **🛠️ Admin Dashboard**: A protected `/admin` route to view live conversation logs and manage settings.
*   **🛡️ Production-Grade Resilience**:
    *   **Rate Limiting**: Protects against abuse (built with Redis).
    *   **Queue Management**: Handles spikes in traffic without crashing.
    *   **Graceful Fallbacks**: If the WebSocket fails, it degrades intelligently.
*   **🎨 Premium UI/UX**: Dark mode aesthetic, glassmorphism effects, and smooth micro-animations.

---

## 🏗️ Technical Architecture

We chose a "Hexagonal Architecture" (Ports and Adapters) to ensure the code is testable, maintainable, and loosely coupled.

### Backend (`/backend`)
*   **Runtime**: Node.js & TypeScript
*   **Framework**: Express.js with Socket.io (for dual REST/WebSocket support)
*   **Database**: SQLite (via Drizzle ORM) for message storage.
*   **Cache/Queue**: Redis (for BullMQ queues and Rate Limiting).
*   **AI Engine**: OpenAI GPT-4o-mini (configured for speed and cost-efficiency).

### Frontend (`/frontend`)
*   **Framework**: SvelteKit (Vite-powered).
*   **Styling**: Pure CSS (scoped components) with a modern Design System.
*   **State**: Svelte Stores for reactive, real-time UI updates.

---

## 🚀 Getting Started

You can have this running locally in about 5 minutes.

### Option A: Docker (Recommended)
The easiest way. Requires Docker & Docker Compose.

1.  **Clone the repo**
    ```bash
    git clone <your-repo-url>
    cd spur
    ```
2.  **Add Environment Variables**
    Create a `.env` file in `backend/` (see `.env.example`). You only really need your OpenAI Key:
    ```env
    OPENAI_API_KEY=sk-...
    ```
3.  **Run it**
    ```bash
    docker-compose up --build
    ```
    *   **Frontend**: [http://localhost:3000](http://localhost:3000)
    *   **Backend**: [http://localhost:3001](http://localhost:3001)

### Option B: Manual Setup (For Development)

**1. Start Redis**
Ensure you have a Redis instance running locally on port 6379.

**2. Start Backend**
```bash
cd backend
npm install
# Update .env with your credentials
npm run dev
```

**3. Start Frontend**
```bash
cd frontend
npm install
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) to see it in action.

---

## 📦 Deployment Guide

Everything is containerized, making deployment to clouds like **AWS**, **GCP**, or **Railway** a breeze.

### Quick Deploy (Railway/Render)
Since this repository is a monorepo with Dockerfiles, PaaS providers like Railway are ideal.
1.  Connect your GitHub Repo.
2.  Add a **Redis** service.
3.  Deploy **Backend** (set `REDIS_URL` and `OPENAI_API_KEY`).
4.  Deploy **Frontend** (set `VITE_API_URL` to your backend's URL).

*(See `deployment_guide.md` for detailed step-by-step instructions.)*

---

## 🤝 Contributing

We love contributions! Please start a discussion or open an issue if you want to add:
*   [ ] OAuth for User Login
*   [ ] Postgres migration for production
*   [ ] File uploads for support tickets

---

### License
MIT © 2024 Spur Shop
