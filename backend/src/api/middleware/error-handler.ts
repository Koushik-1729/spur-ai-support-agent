import { Request, Response, NextFunction } from 'express';
import { LLMError } from '../../infrastructure/adapters/openai.adapter.js';

export interface ApiError extends Error {
    statusCode?: number;
}

export function errorHandler(
    err: ApiError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    console.error('Error:', err.message);

    // Handle LLM-specific errors
    if (err instanceof LLMError) {
        res.status(503).json({
            error: err.message,
            type: 'llm_error',
        });
        return;
    }

    // Handle validation errors
    if (err.statusCode === 400) {
        res.status(400).json({
            error: err.message,
            type: 'validation_error',
        });
        return;
    }

    // Handle not found errors
    if (err.statusCode === 404) {
        res.status(404).json({
            error: err.message,
            type: 'not_found',
        });
        return;
    }

    // Default to 500 for unknown errors
    res.status(err.statusCode || 500).json({
        error: 'Something went wrong. Please try again.',
        type: 'internal_error',
    });
}

// Helper to create API errors
export function createApiError(message: string, statusCode: number): ApiError {
    const error = new Error(message) as ApiError;
    error.statusCode = statusCode;
    return error;
}
