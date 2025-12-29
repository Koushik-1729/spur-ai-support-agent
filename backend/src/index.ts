import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { env, validateEnv, logger } from './config/index.js';
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

validateEnv();
runMigrations();

const llmAdapter = new OpenAIAdapter();
const dbAdapter = new SQLiteAdapter();
await redisAdapter.connect();

const sendMessageUseCase = new SendMessageUseCase(dbAdapter, llmAdapter);
const getHistoryUseCase = new GetHistoryUseCase(dbAdapter);

const chatController = new ChatController(sendMessageUseCase, getHistoryUseCase);
const adminController = new AdminController();

const app = express();
const httpServer = createServer(app);
const io = setupWebSocket(httpServer);

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(globalRateLimiter);

app.use('/chat', chatRateLimiter, createChatRoutes(chatController));
app.use('/admin', createAdminRoutes(adminController));

app.get('/', (_req: express.Request, res: express.Response) => {
    res.json({ status: 'ok' });
});

app.use(errorHandler);

httpServer.listen(env.PORT, () => {
    logger.info('Server started', { port: env.PORT, url: `http://localhost:${env.PORT}` });
});

export { app, httpServer, io };
