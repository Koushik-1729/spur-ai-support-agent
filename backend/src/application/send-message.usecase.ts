import { v4 as uuidv4 } from 'uuid';
import { ConversationPort } from '../domain/ports/conversation.port.js';
import { LLMPort } from '../domain/ports/llm.port.js';
import { createMessage, Message } from '../domain/entities/message.js';

export interface SendMessageInput {
    message: string;
    sessionId?: string;
}

export interface SendMessageOutput {
    reply: string;
    sessionId: string;
    userMessage: Message;
    aiMessage: Message;
}

export class SendMessageUseCase {
    constructor(
        private conversationPort: ConversationPort,
        private llmPort: LLMPort
    ) { }

    async execute(input: SendMessageInput): Promise<SendMessageOutput> {
        // Get or create conversation
        let conversationId = input.sessionId;

        if (conversationId) {
            // Verify conversation exists
            const existing = await this.conversationPort.getConversation(conversationId);
            if (!existing) {
                // Create new if not found (handles invalid session IDs gracefully)
                const newConversation = await this.conversationPort.createConversation();
                conversationId = newConversation.id;
            }
        } else {
            // Create new conversation
            const newConversation = await this.conversationPort.createConversation();
            conversationId = newConversation.id;
        }

        // Create and save user message
        const userMessage = createMessage(
            uuidv4(),
            conversationId,
            'user',
            input.message
        );
        await this.conversationPort.saveMessage(userMessage);

        // Get conversation history
        const history = await this.conversationPort.getMessages(conversationId);

        // Generate AI reply (history already includes the user message we just saved)
        const reply = await this.llmPort.generateReply(
            history.slice(0, -1), // Exclude the message we just sent (it's passed separately)
            input.message
        );

        // Create and save AI message
        const aiMessage = createMessage(
            uuidv4(),
            conversationId,
            'ai',
            reply
        );
        await this.conversationPort.saveMessage(aiMessage);

        return {
            reply,
            sessionId: conversationId,
            userMessage,
            aiMessage,
        };
    }
}
