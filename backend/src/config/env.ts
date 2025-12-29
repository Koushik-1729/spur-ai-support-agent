import { config } from 'dotenv';

// Load environment variables
config();

export const env = {
    // Server
    PORT: parseInt(process.env.PORT || '3001', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',

    // OpenAI
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,

    // LLM Configuration
    MAX_TOKENS: parseInt(process.env.MAX_TOKENS || '500', 10),
    MAX_HISTORY_MESSAGES: parseInt(process.env.MAX_HISTORY_MESSAGES || '10', 10),
    LLM_TIMEOUT_MS: parseInt(process.env.LLM_TIMEOUT_MS || '30000', 10),

    // Validation
    MAX_MESSAGE_LENGTH: parseInt(process.env.MAX_MESSAGE_LENGTH || '5000', 10),

    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',

    // JWT Authentication
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

    // Admin credentials (for demo - in production use DB)
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,

    // Redis (optional)
    REDIS_URL: process.env.REDIS_URL,

    // Database
    DB_PATH: process.env.DB_PATH || './data/chat.db',
};

// Validate required environment variables
export function validateEnv(): void {
    const missingVars: string[] = [];

    if (!env.OPENAI_API_KEY) missingVars.push('OPENAI_API_KEY');
    if (!env.JWT_SECRET) missingVars.push('JWT_SECRET');
    if (!env.ADMIN_EMAIL) missingVars.push('ADMIN_EMAIL');
    if (!env.ADMIN_PASSWORD) missingVars.push('ADMIN_PASSWORD');
    // REDIS_URL remains optional for now as it was marked optional in comments, 
    // but if the user wants it to be strictly from env if used, we just leave it as is (undefined if not set).
    // If the app *requires* Redis, we should add it here. 
    // The user said "such as the opoen ai and redis and all such like", implying they want to provide them.
    // If the app logic handles missing Redis gracefully (it seems to), we don't strictly enforce it unless `redisAdapter` explodes.
    // Let's check redis adapter usage later if needed, but for now enforcing the core ones.

    if (missingVars.length > 0) {
        throw new Error(
            `❌ CRITICAL: The following environment variables are missing: ${missingVars.join(', ')}. application cannot start.`
        );
    }
}
