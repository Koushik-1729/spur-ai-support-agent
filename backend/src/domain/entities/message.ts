// Domain Entity: Message
export type MessageSender = 'user' | 'ai';

export interface Message {
    id: string;
    conversationId: string;
    sender: MessageSender;
    text: string;
    timestamp: Date;
}

export function createMessage(
    id: string,
    conversationId: string,
    sender: MessageSender,
    text: string,
    timestamp: Date = new Date()
): Message {
    return {
        id,
        conversationId,
        sender,
        text,
        timestamp,
    };
}
