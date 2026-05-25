import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/vedaai'),
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_TLS: z.string().default('false'),
  GEMINI_API_KEY: z.string().default(''),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  NODE_ENV: z.string().default('development'),
});

export const env = envSchema.parse(process.env);
