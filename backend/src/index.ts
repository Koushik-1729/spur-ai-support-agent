import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { env, validateEnv } from './config/index.js';
import { runMigrations } from './infrastructure/database/migrate.js';
import { setupWebSocket } from './infrastructure/websocket/index.js';
import { OpenAIAdapter, SQLiteAdapter, redisAdapter } from './infrastructure/adapters/index.js';
import { SendMessageUseCase, GetHistoryUseCase } from './application/index.js';
import {
    ChatController,
    AdminController,
    createChatRoutes,
    createAdminRoutes,
    errorHandler,
    globalRateLimiter,
    chatRateLimiter,
} from './api/index.js';

// Validate environment variables
validateEnv();

// Run database migrations
runMigrations();

// Initialize adapters (infrastructure layer)
const llmAdapter = new OpenAIAdapter();
const dbAdapter = new SQLiteAdapter();
await redisAdapter.connect();

// Initialize use cases (application layer)
const sendMessageUseCase = new SendMessageUseCase(dbAdapter, llmAdapter);
const getHistoryUseCase = new GetHistoryUseCase(dbAdapter);

// Initialize controllers (API layer)
const chatController = new ChatController(sendMessageUseCase, getHistoryUseCase);
const adminController = new AdminController();

// Create Express app
const app = express();

// Create HTTP server for both Express and WebSocket
const httpServer = createServer(app);

// Setup WebSocket for streaming
const io = setupWebSocket(httpServer);

// Global middleware
app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(globalRateLimiter);

// Routes
app.use('/chat', chatRateLimiter, createChatRoutes(chatController));
app.use('/admin', createAdminRoutes(adminController));

// Root health check
app.get('/', (_req, res) => {
    res.json({
        name: 'Spur Chat Backend',
        version: '1.0.0',
        status: 'ok',
        features: [
            'REST API',
            'WebSocket streaming',
            'Rate limiting',
            'JWT Authentication',
            'Admin Dashboard',
            'Analytics',
        ],
    });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
httpServer.listen(env.PORT, () => {
    console.log(`
🚀 Spur Chat Backend is running!
   
   Local:      http://localhost:${env.PORT}
   Health:     http://localhost:${env.PORT}/chat/health
   WebSocket:  ws://localhost:${env.PORT}
   Admin:      http://localhost:${env.PORT}/admin
   
   Mode:       ${env.NODE_ENV}
   
   Features:
   ✅ REST API
   ✅ WebSocket Streaming
   ✅ Rate Limiting
   ✅ JWT Authentication
   ✅ Admin Dashboard
   ✅ Analytics
  `);
});

export { app, httpServer, io };
