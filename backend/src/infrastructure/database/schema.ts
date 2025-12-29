import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Conversations table
export const conversations = sqliteTable('conversations', {
    id: text('id').primaryKey(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    metadata: text('metadata', { mode: 'json' }),
});

// Messages table
export const messages = sqliteTable('messages', {
    id: text('id').primaryKey(),
    conversationId: text('conversation_id')
        .notNull()
        .references(() => conversations.id),
    sender: text('sender', { enum: ['user', 'ai'] }).notNull(),
    text: text('text').notNull(),
    timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

// Type exports for Drizzle
export type ConversationRecord = typeof conversations.$inferSelect;
export type MessageRecord = typeof messages.$inferSelect;
