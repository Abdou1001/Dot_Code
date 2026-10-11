import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { getCache, setCache } from "../../services/cache.service.js";
import { CACHE_KEYS, CACHE_TTL } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Get one technology by ID or slug
// @Route GET /api/technologies/:id
// @Access Public
export const getTechnologyById = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new ApiError("Technology identifier is required", 400));
    }

    const normalizedId = id.trim();
    const isUuid = UUID_REGEX.test(normalizedId);
    const isAdmin = Boolean(req.isAdmin);
    const cacheKey = CACHE_KEYS.TECHNOLOGY(normalizedId.toLowerCase());

    // 1. Try reading from cache (public only)
    if (!isAdmin) {
        const cachedTechnology = await getCache(cacheKey);
        if (cachedTechnology) {
            return sendSuccess(res, {
                statusCode: 200,
                message: "Technology retrieved successfully",
                results: cachedTechnology,
            });
        }
    }

    // 2. Query Supabase
    let query = supabase.from("technologies").select("*");

    if (isUuid) {
        query = query.eq("id", normalizedId);
    } else {
        query = query.eq("slug", normalizedId.toLowerCase());
    }

    if (!isAdmin) {
        query = query.eq("is_active", true);
    }

    const { data: technology, error } = await query.maybeSingle();

    if (error) {
        return next(new ApiError("Failed to retrieve technology", 500));
    }

    if (!technology) {
        return next(new ApiError("Technology not found", 404));
    }

    // 3. Cache technology for public users
    if (!isAdmin) {
        await setCache(cacheKey, technology, CACHE_TTL.TECHNOLOGIES);
        if (technology.id !== normalizedId) {
            await setCache(CACHE_KEYS.TECHNOLOGY(technology.id), technology, CACHE_TTL.TECHNOLOGIES);
        }
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "Technology retrieved successfully",
        results: technology,
    });
});
