import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3001'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    FRONTEND_URL: z.string().optional(),
    CRONOS_RPC_URL: z.string().url().default('https://evm-t3.cronos.org'),
    CRONOS_CHAIN_ID: z.string().default('338'),
    CDC_DASHBOARD_API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    OLLAMA_API_URL: z.string().optional(),
    OLLAMA_MODEL: z.string().default('llama2'),
    CDC_PROVIDER_URL: z.string().optional(),
    PRIVATE_KEY: z.string().optional(),
});


const parseEnv = () => {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
        throw new Error('Invalid environment variables');
    }

    return parsed.data;
};

export const env = parseEnv();
