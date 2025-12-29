import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendMessageUseCase } from '../src/application/send-message.usecase.js';
import { ConversationPort } from '../src/domain/ports/conversation.port.js';
import { LLMPort } from '../src/domain/ports/llm.port.js';
import { Conversation } from '../src/domain/entities/conversation.js';
import { Message } from '../src/domain/entities/message.js';

const mockConversation: Conversation = {
    id: 'conv-123',
    createdAt: new Date(),
};

const mockMessage: Message = {
    id: 'msg-123',
    conversationId: 'conv-123',
    sender: 'user',
    text: 'Hello',
    timestamp: new Date(),
};

describe('SendMessageUseCase', () => {
    let useCase: SendMessageUseCase;
    let mockConversationPort: ConversationPort;
    let mockLLMPort: LLMPort;

    beforeEach(() => {
        mockConversationPort = {
            createConversation: vi.fn().mockResolvedValue(mockConversation),
            getConversation: vi.fn().mockResolvedValue(mockConversation),
            saveMessage: vi.fn().mockResolvedValue(undefined),
            getMessages: vi.fn().mockResolvedValue([mockMessage]),
        };

        mockLLMPort = {
            generateReply: vi.fn().mockResolvedValue('Hello! How can I help you?'),
            generateStreamingReply: vi.fn(),
        };

        useCase = new SendMessageUseCase(mockConversationPort, mockLLMPort);
    });

    it('creates a new conversation if no sessionId provided', async () => {
        const result = await useCase.execute({ message: 'Hello' });

        expect(mockConversationPort.createConversation).toHaveBeenCalled();
        expect(result.sessionId).toBe('conv-123');
    });

    it('uses existing conversation if sessionId provided', async () => {
        const result = await useCase.execute({
            message: 'Hello',
            sessionId: 'conv-123',
        });

        expect(mockConversationPort.getConversation).toHaveBeenCalledWith('conv-123');
        expect(mockConversationPort.createConversation).not.toHaveBeenCalled();
        expect(result.sessionId).toBe('conv-123');
    });

    it('creates new conversation if provided sessionId not found', async () => {
        mockConversationPort.getConversation = vi.fn().mockResolvedValue(null);

        const result = await useCase.execute({
            message: 'Hello',
            sessionId: 'invalid-id',
        });

        expect(mockConversationPort.createConversation).toHaveBeenCalled();
        expect(result.sessionId).toBe('conv-123');
    });

    it('saves user message and AI response', async () => {
        await useCase.execute({ message: 'Hello' });

        expect(mockConversationPort.saveMessage).toHaveBeenCalledTimes(2);
    });

    it('returns AI reply in response', async () => {
        const result = await useCase.execute({ message: 'Hello' });

        expect(result.reply).toBe('Hello! How can I help you?');
    });

    it('passes conversation history to LLM', async () => {
        await useCase.execute({ message: 'Hello' });

        expect(mockLLMPort.generateReply).toHaveBeenCalledWith(
            [], // history minus the message just sent
            'Hello'
        );
    });
});
