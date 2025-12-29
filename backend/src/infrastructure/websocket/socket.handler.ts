import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/index.js';
import { OpenAIAdapter } from '../adapters/openai.adapter.js';
import { SQLiteAdapter } from '../adapters/sqlite.adapter.js';
import { createMessage } from '../../domain/entities/message.js';
import { redisAdapter } from '../adapters/redis.adapter.js';

export function setupWebSocket(httpServer: HTTPServer): SocketIOServer {
    const corsOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: (origin, callback) => {
                if (!origin) return callback(null, true);
                if (corsOrigins.includes(origin) || corsOrigins.includes('*')) {
                    return callback(null, true);
                }
                callback(new Error('Not allowed by CORS'));
            },
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    const llmAdapter = new OpenAIAdapter();
    const dbAdapter = new SQLiteAdapter();

    io.on('connection', (socket: Socket) => {
        console.log(`Client connected: ${socket.id}`);

        socket.on('sendMessage', async (data: { message: string; sessionId?: string }) => {
            const { message, sessionId } = data;

            if (!message?.trim()) {
                socket.emit('error', { message: 'Message cannot be empty' });
                return;
            }

            try {
                let conversationId = sessionId;

                if (conversationId) {
                    const existing = await dbAdapter.getConversation(conversationId);
                    if (!existing) {
                        const newConversation = await dbAdapter.createConversation();
                        conversationId = newConversation.id;
                    }
                } else {
                    const newConversation = await dbAdapter.createConversation();
                    conversationId = newConversation.id;
                }

                const userMessage = createMessage(
                    uuidv4(),
                    conversationId,
                    'user',
                    message.trim()
                );
                await dbAdapter.saveMessage(userMessage);
                await redisAdapter.del(`conversation:${conversationId}:history`);

                socket.emit('messageReceived', {
                    sessionId: conversationId,
                    userMessage: {
                        id: userMessage.id,
                        sender: 'user',
                        text: userMessage.text,
                        timestamp: userMessage.timestamp.toISOString(),
                    },
                });

                const cacheKey = `conversation:${conversationId}:history`;
                let history;
                const cachedHistory = await redisAdapter.get(cacheKey);

                if (cachedHistory) {
                    history = JSON.parse(cachedHistory);
                } else {
                    history = await dbAdapter.getMessages(conversationId);
                    await redisAdapter.set(cacheKey, JSON.stringify(history), 60 * 60); // Cache for 1 hour
                }

                socket.emit('typingStart');

                let fullResponse = '';
                const aiMessageId = uuidv4();

                try {
                    for await (const chunk of llmAdapter.generateStreamingReply(
                        history.slice(0, -1),
                        message.trim()
                    )) {
                        fullResponse += chunk;
                        socket.emit('streamChunk', {
                            chunk,
                            messageId: aiMessageId,
                        });
                    }

                    const aiMessage = createMessage(
                        aiMessageId,
                        conversationId,
                        'ai',
                        fullResponse
                    );
                    await dbAdapter.saveMessage(aiMessage);
                    await redisAdapter.del(`conversation:${conversationId}:history`);

                    socket.emit('streamComplete', {
                        sessionId: conversationId,
                        aiMessage: {
                            id: aiMessage.id,
                            sender: 'ai',
                            text: fullResponse,
                            timestamp: aiMessage.timestamp.toISOString(),
                        },
                    });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to generate response';
                    socket.emit('error', { message: errorMessage });
                }

                socket.emit('typingStop');
            } catch (error) {
                console.error('WebSocket error:', error);
                socket.emit('error', { message: 'Something went wrong. Please try again.' });
                socket.emit('typingStop');
            }
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    return io;
}
