import { config } from 'dotenv';

// Load environment variables
config();

export const env = {
    // Server
    PORT: parseInt(process.env.PORT || '3001', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',

    // OpenAI
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',

    // LLM Configuration
    MAX_TOKENS: parseInt(process.env.MAX_TOKENS || '500', 10),
    MAX_HISTORY_MESSAGES: parseInt(process.env.MAX_HISTORY_MESSAGES || '10', 10),
    LLM_TIMEOUT_MS: parseInt(process.env.LLM_TIMEOUT_MS || '30000', 10),

    // Validation
    MAX_MESSAGE_LENGTH: parseInt(process.env.MAX_MESSAGE_LENGTH || '5000', 10),

    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',

    // JWT Authentication
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

    // Admin credentials (for demo - in production use DB)
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@spurshop.com',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',

    // Redis (optional)
    REDIS_URL: process.env.REDIS_URL || '',
};

// Validate required environment variables
export function validateEnv(): void {
    const missingVars: string[] = [];

    if (!env.OPENAI_API_KEY) {
        missingVars.push('OPENAI_API_KEY');
    }

    if (!env.JWT_SECRET || env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
        console.warn('⚠️  WARNING: Using default or empty JWT_SECRET. Set a secure secret in production.');
    }

    if (!env.REDIS_URL) {
        console.warn('⚠️  WARNING: REDIS_URL is not set. Caching and rate limiting may not work as expected.');
    }

    if (missingVars.length > 0) {
        console.warn(
            `⚠️  WARNING: The following environment variables are missing: ${missingVars.join(', ')}. Some features may not work.`
        );
    }
}
