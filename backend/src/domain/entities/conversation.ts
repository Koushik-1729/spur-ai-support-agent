// Domain Entity: Conversation
export interface Conversation {
    id: string;
    createdAt: Date;
    metadata?: Record<string, unknown>;
}

export function createConversation(
    id: string,
    createdAt: Date = new Date(),
    metadata?: Record<string, unknown>
): Conversation {
    return {
        id,
        createdAt,
        metadata,
    };
}
