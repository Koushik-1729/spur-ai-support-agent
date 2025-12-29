import { Request, Response, NextFunction } from 'express';
import { SendMessageUseCase } from '../../application/send-message.usecase.js';
import { GetHistoryUseCase } from '../../application/get-history.usecase.js';
import {
    validateSendMessage,
    validateSessionId,
} from '../validators/chat.validator.js';
import { createApiError } from '../middleware/error-handler.js';

export class ChatController {
    constructor(
        private sendMessageUseCase: SendMessageUseCase,
        private getHistoryUseCase: GetHistoryUseCase
    ) { }

    // POST /chat/message
    sendMessage = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            // Validate input
            const validation = validateSendMessage(req.body);

            if (!validation.success) {
                throw createApiError(validation.error!, 400);
            }

            const { message, sessionId } = validation.data!;

            // Execute use case
            const result = await this.sendMessageUseCase.execute({
                message,
                sessionId,
            });

            // Return response
            res.json({
                reply: result.reply,
                sessionId: result.sessionId,
                timestamp: result.aiMessage.timestamp.toISOString(),
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /chat/history/:sessionId
    getHistory = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { sessionId } = req.params;

            // Validate session ID
            const validation = validateSessionId(sessionId);

            if (!validation.success) {
                throw createApiError(validation.error!, 400);
            }

            // Execute use case
            const result = await this.getHistoryUseCase.execute({
                sessionId: validation.data!,
            });

            if (!result) {
                throw createApiError('Conversation not found', 404);
            }

            // Return response
            res.json({
                sessionId: result.sessionId,
                messages: result.messages.map((msg) => ({
                    id: msg.id,
                    sender: msg.sender,
                    text: msg.text,
                    timestamp: msg.timestamp.toISOString(),
                })),
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /chat/health
    healthCheck = (_req: Request, res: Response): void => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    };
}
