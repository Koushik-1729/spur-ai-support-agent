import { z } from 'zod';
import { env } from '../../config/index.js';

// Validation schema for sending a message
export const sendMessageSchema = z.object({
    message: z
        .string()
        .min(1, 'Message cannot be empty')
        .max(env.MAX_MESSAGE_LENGTH, `Message too long (max ${env.MAX_MESSAGE_LENGTH} characters)`)
        .transform((val) => val.trim()),
    sessionId: z.string().uuid().optional(),
});

// Validation schema for session ID parameter
export const sessionIdSchema = z.string().uuid('Invalid session ID format');

// Type exports
export type SendMessageRequest = z.infer<typeof sendMessageSchema>;

// Validation result type
export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Validation functions
export function validateSendMessage(body: unknown): ValidationResult<SendMessageRequest> {
    const result = sendMessageSchema.safeParse(body);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errorMessage = result.error.errors
        .map((e) => e.message)
        .join(', ');

    return { success: false, error: errorMessage };
}

export function validateSessionId(sessionId: string): ValidationResult<string> {
    const result = sessionIdSchema.safeParse(sessionId);

    if (result.success) {
        return { success: true, data: result.data };
    }

    return { success: false, error: 'Invalid session ID format' };
}
