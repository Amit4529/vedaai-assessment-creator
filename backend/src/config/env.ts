import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const emptyToUndefined = z.preprocess((val) => (val === '' ? undefined : val), z.string().optional());

const robustCoerceNumber = (defaultValue: number) =>
  z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return defaultValue;
    const parsed = Number(String(val).trim());
    return isNaN(parsed) ? defaultValue : parsed;
  }, z.number().default(defaultValue));

const envSchema = z.object({
  PORT: robustCoerceNumber(5000),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/vedaai'),
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: robustCoerceNumber(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_TLS: z.string().default('false'),
  GEMINI_API_KEY: z.string().default(''),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  NODE_ENV: z.string().default('development'),
});

export const env = envSchema.parse(process.env);
