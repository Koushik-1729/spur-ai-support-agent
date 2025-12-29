import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller.js';

export function createChatRoutes(controller: ChatController): Router {
    const router = Router();

    // POST /chat/message - Send a message and get AI reply
    router.post('/message', controller.sendMessage);

    // GET /chat/history/:sessionId - Get conversation history
    router.get('/history/:sessionId', controller.getHistory);

    // GET /chat/health - Health check
    router.get('/health', controller.healthCheck);

    return router;
}
