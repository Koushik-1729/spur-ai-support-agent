import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { ConversationPort } from '../../domain/ports/conversation.port.js';
import {
    Conversation,
    createConversation,
} from '../../domain/entities/conversation.js';
import { Message, createMessage } from '../../domain/entities/message.js';
import { db, conversations, messages } from '../database/index.js';

export class SQLiteAdapter implements ConversationPort {
    async createConversation(): Promise<Conversation> {
        const id = uuidv4();
        const createdAt = new Date();

        await db.insert(conversations).values({
            id,
            createdAt,
            metadata: null,
        });

        return createConversation(id, createdAt);
    }

    async getConversation(id: string): Promise<Conversation | null> {
        const result = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, id))
            .limit(1);

        if (result.length === 0) {
            return null;
        }

        const row = result[0];
        return createConversation(
            row.id,
            row.createdAt,
            row.metadata as Record<string, unknown> | undefined
        );
    }

    async saveMessage(message: Message): Promise<void> {
        await db.insert(messages).values({
            id: message.id,
            conversationId: message.conversationId,
            sender: message.sender,
            text: message.text,
            timestamp: message.timestamp,
        });
    }

    async getMessages(conversationId: string): Promise<Message[]> {
        const result = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conversationId))
            .orderBy(messages.timestamp);

        return result.map((row) =>
            createMessage(
                row.id,
                row.conversationId,
                row.sender as 'user' | 'ai',
                row.text,
                row.timestamp
            )
        );
    }
}
