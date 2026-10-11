import Redis from "ioredis";
import { env } from "./env.js";

export const redis = new Redis({
    host: env.REDIS_HOST || "127.0.0.1",
    port: Number(env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
        // Stop retrying quickly if no server is running locally
        if (times > 3) return null;
        return Math.min(times * 100, 2000);
    },
});

redis.on("connect", () => {
    console.log("✅ Redis Connected");
});

redis.on("error", (err) => {
    console.error("❌ Redis Error:", err.message);
});
