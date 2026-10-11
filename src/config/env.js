import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const environmentSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    MODE_DEV: z.enum(["development", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(5175),
    FRONTEND_URL: z.url().default("http://localhost:3000"),
    SUPABASE_URL: z.url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    SECRET_KEY_JWT: z.string().min(32),
    JWT_EXPIRES_IN: z.string().min(1).default("7d"),
    REDIS_HOST: z.string().default("127.0.0.1"),
    REDIS_PORT: z.coerce.number().default(6379),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
    const missingVariables = parsedEnvironment.error.issues
        .map((issue) => issue.path.join("."))
        .join(", ");

    throw new Error(`Environment validation failed: ${missingVariables}`);
}

export const env = parsedEnvironment.data;
