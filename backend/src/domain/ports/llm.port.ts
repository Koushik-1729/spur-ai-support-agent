import { Message } from '../entities/message.js';

export interface LLMPort {
    generateReply(history: Message[], userMessage: string): Promise<string>;
    generateStreamingReply(history: Message[], userMessage: string): AsyncGenerator<string, void, unknown>;
}

