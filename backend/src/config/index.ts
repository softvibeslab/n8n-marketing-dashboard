/**
 * ===========================================
 * Application Configuration
 * ===========================================
 */

import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

/**
 * Environment schema validation
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  HOST: z.string().default('localhost'),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // n8n
  N8N_API_URL: z.string().url(),
  N8N_API_KEY: z.string().min(1),
  N8N_WEBHOOK_SECRET: z.string().min(1),

  // OpenAI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4-turbo-preview'),
  OPENAI_MAX_TOKENS: z.string().transform(Number).default('2000'),

  // Groq
  GROQ_API_KEY: z.string().optional(),

  // Encryption
  ENCRYPTION_KEY: z.string().length(32),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'text']).default('json'),

  // WebSocket
  WS_PORT: z.string().transform(Number).default('3002'),
  WS_PATH: z.string().default('/socket.io/'),
});

/**
 * Validated environment variables
 */
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment configuration:');
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const config = {
  env: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,
  host: parsedEnv.data.HOST,

  database: {
    url: parsedEnv.data.DATABASE_URL,
  },

  redis: {
    url: parsedEnv.data.REDIS_URL,
    password: parsedEnv.data.REDIS_PASSWORD,
  },

  jwt: {
    secret: parsedEnv.data.JWT_SECRET,
    accessExpiration: parsedEnv.data.JWT_ACCESS_EXPIRATION,
    refreshExpiration: parsedEnv.data.JWT_REFRESH_EXPIRATION,
  },

  cors: {
    origin: parsedEnv.data.CORS_ORIGIN.split(',').map(origin => origin.trim()),
  },

  rateLimit: {
    windowMs: parsedEnv.data.RATE_LIMIT_WINDOW_MS,
    maxRequests: parsedEnv.data.RATE_LIMIT_MAX_REQUESTS,
  },

  n8n: {
    apiUrl: parsedEnv.data.N8N_API_URL,
    apiKey: parsedEnv.data.N8N_API_KEY,
    webhookSecret: parsedEnv.data.N8N_WEBHOOK_SECRET,
    webhookUrl: parsedEnv.data.N8N_API_URL.replace('/api/v1', '') + '/webhook',
  },

  ai: {
    openaiApiKey: parsedEnv.data.OPENAI_API_KEY,
    groqApiKey: parsedEnv.data.GROQ_API_KEY,
    model: parsedEnv.data.OPENAI_MODEL,
    maxTokens: parsedEnv.data.OPENAI_MAX_TOKENS,
  },

  encryption: {
    key: parsedEnv.data.ENCRYPTION_KEY,
  },

  logging: {
    level: parsedEnv.data.LOG_LEVEL,
    format: parsedEnv.data.LOG_FORMAT,
  },

  websocket: {
    port: parsedEnv.data.WS_PORT,
    path: parsedEnv.data.WS_PATH,
  },
} as const;

export type Config = typeof config;
