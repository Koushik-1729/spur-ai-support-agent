import { Request, Response, NextFunction } from 'express';
import { db, conversations, messages } from '../../infrastructure/database/index.js';
import { count, desc, eq } from 'drizzle-orm';
import { AuthenticatedRequest, generateToken } from '../middleware/auth.js';
import { env } from '../../config/index.js';

export class AdminController {
    // POST /admin/login
    login = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ error: 'Email and password required', type: 'validation_error' });
                return;
            }

            // Simple auth for demo (in production, use hashed passwords in DB)
            if (email === env.ADMIN_EMAIL && password === env.ADMIN_PASSWORD) {
                const token = generateToken({
                    userId: 'admin-1',
                    email,
                    role: 'admin',
                });

                res.json({ token, email, role: 'admin' });
            } else {
                res.status(401).json({ error: 'Invalid credentials', type: 'auth_error' });
            }
        } catch (error) {
            next(error);
        }
    };

    // GET /admin/dashboard - Get dashboard stats
    getDashboard = async (
        _req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            // Get total conversations
            const totalConversations = await db
                .select({ count: count() })
                .from(conversations);

            // Get total messages
            const totalMessages = await db
                .select({ count: count() })
                .from(messages);

            // Get messages by sender type
            const messagesBySender = await db
                .select({
                    sender: messages.sender,
                    count: count(),
                })
                .from(messages)
                .groupBy(messages.sender);

            // Get recent conversations
            const recentConversations = await db
                .select({
                    id: conversations.id,
                    createdAt: conversations.createdAt,
                    messageCount: count(messages.id),
                })
                .from(conversations)
                .leftJoin(messages, eq(conversations.id, messages.conversationId))
                .groupBy(conversations.id)
                .orderBy(desc(conversations.createdAt))
                .limit(10);

            res.json({
                stats: {
                    totalConversations: totalConversations[0]?.count || 0,
                    totalMessages: totalMessages[0]?.count || 0,
                    userMessages: messagesBySender.find(m => m.sender === 'user')?.count || 0,
                    aiMessages: messagesBySender.find(m => m.sender === 'ai')?.count || 0,
                },
                recentConversations: recentConversations.map(c => ({
                    id: c.id,
                    createdAt: c.createdAt,
                    messageCount: c.messageCount,
                })),
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /admin/conversations - List all conversations
    getConversations = async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = (page - 1) * limit;

            const allConversations = await db
                .select({
                    id: conversations.id,
                    createdAt: conversations.createdAt,
                    messageCount: count(messages.id),
                })
                .from(conversations)
                .leftJoin(messages, eq(conversations.id, messages.conversationId))
                .groupBy(conversations.id)
                .orderBy(desc(conversations.createdAt))
                .limit(limit)
                .offset(offset);

            const total = await db.select({ count: count() }).from(conversations);

            res.json({
                conversations: allConversations,
                pagination: {
                    page,
                    limit,
                    total: total[0]?.count || 0,
                    totalPages: Math.ceil((total[0]?.count || 0) / limit),
                },
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /admin/conversations/:id - Get conversation details
    getConversation = async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;

            const conversation = await db
                .select()
                .from(conversations)
                .where(eq(conversations.id, id))
                .limit(1);

            if (conversation.length === 0) {
                res.status(404).json({ error: 'Conversation not found', type: 'not_found' });
                return;
            }

            const conversationMessages = await db
                .select()
                .from(messages)
                .where(eq(messages.conversationId, id))
                .orderBy(messages.timestamp);

            res.json({
                conversation: conversation[0],
                messages: conversationMessages.map(m => ({
                    id: m.id,
                    sender: m.sender,
                    text: m.text,
                    timestamp: m.timestamp,
                })),
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /admin/analytics - Get analytics data
    getAnalytics = async (
        _req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            // Get messages per day (last 7 days)
            const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

            // Get common question keywords (simple word frequency)
            const userMessages = await db
                .select({ text: messages.text })
                .from(messages)
                .where(eq(messages.sender, 'user'));

            // Simple keyword extraction
            const wordFrequency: Record<string, number> = {};
            const stopWords = new Set(['what', 'is', 'the', 'a', 'an', 'do', 'you', 'your', 'to', 'i', 'can', 'how', 'where', 'when', 'why', 'are', 'have', 'has', 'my', 'me']);

            userMessages.forEach(msg => {
                const words = msg.text.toLowerCase()
                    .replace(/[^a-z\s]/g, '')
                    .split(/\s+/)
                    .filter(w => w.length > 2 && !stopWords.has(w));

                words.forEach(word => {
                    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
                });
            });

            // Get top 10 keywords
            const topKeywords = Object.entries(wordFrequency)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([word, count]) => ({ word, count }));

            // Average messages per conversation - simplified query
            const conversationCounts = await db
                .select({
                    conversationId: messages.conversationId,
                    msgCount: count(),
                })
                .from(messages)
                .groupBy(messages.conversationId);

            const avgMessagesPerConv = conversationCounts.length > 0
                ? conversationCounts.reduce((sum, c) => sum + c.msgCount, 0) / conversationCounts.length
                : 0;

            res.json({
                topKeywords,
                averageMessagesPerConversation: Math.round(avgMessagesPerConv),
                totalUserMessages: userMessages.length,
            });
        } catch (error) {
            next(error);
        }
    };
}
