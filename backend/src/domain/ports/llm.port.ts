import { Message } from '../entities/message.js';

// Port (interface) for LLM integration
// This follows hexagonal architecture - the domain defines what it needs,
// and the infrastructure provides the implementation
export interface LLMPort {
    /**
     * Generate a reply based on conversation history and the current user message
     * @param history - Previous messages in the conversation
     * @param userMessage - The current user message
     * @returns The AI-generated reply
     */
    generateReply(history: Message[], userMessage: string): Promise<string>;
}
