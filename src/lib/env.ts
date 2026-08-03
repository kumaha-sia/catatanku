import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  GOOGLE_AI_API_KEY: z.string().optional(),
  GOOGLE_VISION_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
