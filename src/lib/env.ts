import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().min(1),
  GOOGLE_AI_API_KEY: z.string().optional(),
  GOOGLE_VISION_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
});

let _env: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (!_env) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      const missing = result.error.issues
        .filter((i) => i.code === "too_small" || i.code === "invalid_type")
        .map((i) => i.path.join("."));
      console.warn(
        `[env] Missing or invalid env vars: ${missing.join(", ")}. Some features may not work.`,
      );
      _env = {
        DATABASE_URL: process.env.DATABASE_URL ?? "",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "",
        GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY,
        GOOGLE_VISION_API_KEY: process.env.GOOGLE_VISION_API_KEY,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
      };
    } else {
      _env = result.data;
    }
  }
  return _env;
}

export const env = getEnv();
