import { Conversation } from '../entities/conversation.js';
import { Message } from '../entities/message.js';

// Port (interface) for conversation persistence
// This allows us to swap out the database implementation easily
export interface ConversationPort {
    /**
     * Create a new conversation
     */
    createConversation(): Promise<Conversation>;

    /**
     * Get a conversation by ID
     */
    getConversation(id: string): Promise<Conversation | null>;

    /**
     * Save a message to the database
     */
    saveMessage(message: Message): Promise<void>;

    /**
     * Get all messages for a conversation
     */
    getMessages(conversationId: string): Promise<Message[]>;
}
