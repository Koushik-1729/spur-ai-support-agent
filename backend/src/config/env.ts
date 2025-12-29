import { config } from 'dotenv';
config();

export const env = {
    PORT: parseInt(process.env.PORT || '3001', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    MAX_TOKENS: parseInt(process.env.MAX_TOKENS || '500', 10),
    MAX_HISTORY_MESSAGES: parseInt(process.env.MAX_HISTORY_MESSAGES || '10', 10),
    LLM_TIMEOUT_MS: parseInt(process.env.LLM_TIMEOUT_MS || '30000', 10),
    MAX_MESSAGE_LENGTH: parseInt(process.env.MAX_MESSAGE_LENGTH || '5000', 10),
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    REDIS_URL: process.env.REDIS_URL,
    DB_PATH: process.env.DB_PATH || './data/chat.db',
};

export function validateEnv(): void {
    const missing: string[] = [];
    if (!env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY');
    if (!env.JWT_SECRET) missing.push('JWT_SECRET');
    if (!env.ADMIN_EMAIL) missing.push('ADMIN_EMAIL');
    if (!env.ADMIN_PASSWORD) missing.push('ADMIN_PASSWORD');

    if (missing.length > 0) {
        throw new Error(`Missing env vars: ${missing.join(', ')}`);
    }
}
