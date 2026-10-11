import { redis } from "../config/redis.js";

/**
 * الحصول على البيانات من Redis
 */
export const getCache = async (key) => {
    try {
        const data = await redis.get(key);
        if (!data) return null;
        return JSON.parse(data);
    } catch (error) {
        console.error(`Cache get error for key "${key}":`, error.message);
        return null;
    }
};

/**
 * حفظ البيانات في Redis
 */
export const setCache = async (key, value, ttl = 3600) => {
    try {
        await redis.set(key, JSON.stringify(value), "EX", ttl);
    } catch (error) {
        console.error(`Cache set error for key "${key}":`, error.message);
    }
};

/**
 * حذف كاش معين
 */
export const deleteCache = async (key) => {
    try {
        await redis.del(key);
    } catch (error) {
        console.error(`Cache delete error for key "${key}":`, error.message);
    }
};

/**
 * حذف الكاش بناءً على نمط (Pattern)
 */
export const deleteByPattern = async (pattern) => {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch (error) {
        console.error(`Cache deleteByPattern error for pattern "${pattern}":`, error.message);
    }
};
