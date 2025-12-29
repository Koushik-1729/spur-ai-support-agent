import OpenAI from 'openai';
import { LLMPort } from '../../domain/ports/llm.port.js';
import { Message } from '../../domain/entities/message.js';
import { env, SYSTEM_PROMPT } from '../../config/index.js';

// Custom error types for better error handling
export class LLMError extends Error {
    constructor(
        message: string,
        public readonly type:
            | 'timeout'
            | 'rate_limit'
            | 'auth'
            | 'network'
            | 'unknown'
    ) {
        super(message);
        this.name = 'LLMError';
    }
}

export class OpenAIAdapter implements LLMPort {
    private client: OpenAI;
    private model = 'gpt-4o-mini';
    private maxTokens: number;
    private maxHistoryMessages: number;

    constructor() {
        this.client = new OpenAI({
            apiKey: env.OPENAI_API_KEY,
            timeout: env.LLM_TIMEOUT_MS,
        });
        this.maxTokens = env.MAX_TOKENS;
        this.maxHistoryMessages = env.MAX_HISTORY_MESSAGES;
    }

    async generateReply(history: Message[], userMessage: string): Promise<string> {
        try {
            // Limit history to prevent token overflow
            const recentHistory = history.slice(-this.maxHistoryMessages);

            // Build messages array for OpenAI
            const messages: OpenAI.ChatCompletionMessageParam[] = [
                { role: 'system', content: SYSTEM_PROMPT },
                ...recentHistory.map((msg) => ({
                    role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
                    content: msg.text,
                })),
                { role: 'user', content: userMessage },
            ];

            const response = await this.client.chat.completions.create({
                model: this.model,
                messages,
                max_tokens: this.maxTokens,
                temperature: 0.7,
            });

            const reply = response.choices[0]?.message?.content;

            if (!reply) {
                throw new LLMError('No response from AI', 'unknown');
            }

            return reply.trim();
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Generate a streaming reply - yields chunks as they arrive
     */
    async *generateStreamingReply(
        history: Message[],
        userMessage: string
    ): AsyncGenerator<string, void, unknown> {
        try {
            const recentHistory = history.slice(-this.maxHistoryMessages);

            const messages: OpenAI.ChatCompletionMessageParam[] = [
                { role: 'system', content: SYSTEM_PROMPT },
                ...recentHistory.map((msg) => ({
                    role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
                    content: msg.text,
                })),
                { role: 'user', content: userMessage },
            ];

            const stream = await this.client.chat.completions.create({
                model: this.model,
                messages,
                max_tokens: this.maxTokens,
                temperature: 0.7,
                stream: true,
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    yield content;
                }
            }
        } catch (error) {
            throw this.handleError(error);
        }
    }

    private handleError(error: unknown): LLMError {
        if (error instanceof LLMError) {
            return error;
        }

        if (error instanceof OpenAI.APIError) {
            if (error.status === 401) {
                console.error('OpenAI API key is invalid');
                return new LLMError(
                    'Our support system is temporarily unavailable. Please try again later.',
                    'auth'
                );
            }

            if (error.status === 429) {
                console.error('OpenAI rate limit exceeded');
                return new LLMError(
                    "We're experiencing high demand. Please try again in a moment.",
                    'rate_limit'
                );
            }

            if (error.status === 408 || error.code === 'ETIMEDOUT') {
                console.error('OpenAI request timed out');
                return new LLMError(
                    "Sorry, I'm taking longer than expected. Please try again.",
                    'timeout'
                );
            }
        }

        if (error instanceof Error) {
            if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
                console.error('Network error connecting to OpenAI:', error.message);
                return new LLMError(
                    'Connection error. Please check your internet and try again.',
                    'network'
                );
            }
        }

        console.error('Unknown LLM error:', error);
        return new LLMError(
            'Something went wrong. Please try again.',
            'unknown'
        );
    }
}
