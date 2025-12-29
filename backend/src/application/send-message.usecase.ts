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
        let conversationId = input.sessionId;

        if (conversationId) {
            const existing = await this.conversationPort.getConversation(conversationId);
            if (!existing) {
                const newConversation = await this.conversationPort.createConversation();
                conversationId = newConversation.id;
            }
        } else {
            const newConversation = await this.conversationPort.createConversation();
            conversationId = newConversation.id;
        }

        const userMessage = createMessage(
            uuidv4(),
            conversationId,
            'user',
            input.message
        );
        await this.conversationPort.saveMessage(userMessage);

        const history = await this.conversationPort.getMessages(conversationId);

        const reply = await this.llmPort.generateReply(
            history.slice(0, -1),
            input.message
        );

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
