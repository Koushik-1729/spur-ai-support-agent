import { ConversationPort } from '../domain/ports/conversation.port.js';
import { Message } from '../domain/entities/message.js';

export interface GetHistoryInput {
    sessionId: string;
}

export interface GetHistoryOutput {
    messages: Message[];
    sessionId: string;
}

export class GetHistoryUseCase {
    constructor(private conversationPort: ConversationPort) { }

    async execute(input: GetHistoryInput): Promise<GetHistoryOutput | null> {
        // Check if conversation exists
        const conversation = await this.conversationPort.getConversation(
            input.sessionId
        );

        if (!conversation) {
            return null;
        }

        // Get all messages
        const messages = await this.conversationPort.getMessages(input.sessionId);

        return {
            messages,
            sessionId: input.sessionId,
        };
    }
}
