import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { getCache, setCache } from "../../services/cache.service.js";
import { CACHE_KEYS, CACHE_TTL } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Get one service by ID or slug
// @Route GET /api/services/:id
// @Access Public
export const getServiceById = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new ApiError("Service identifier is required", 400));
    }

    const normalizedId = id.trim();
    const isUuid = UUID_REGEX.test(normalizedId);
    const isAdmin = Boolean(req.isAdmin);
    const cacheKey = CACHE_KEYS.SERVICE(normalizedId.toLowerCase());

    // 1. Try reading from cache (public only)
    if (!isAdmin) {
        const cachedService = await getCache(cacheKey);
        if (cachedService) {
            return sendSuccess(res, {
                statusCode: 200,
                message: "Service retrieved successfully",
                results: cachedService,
            });
        }
    }

    // 2. Query Supabase
    let query = supabase.from("services").select("*");

    if (isUuid) {
        query = query.eq("id", normalizedId);
    } else {
        query = query.eq("slug", normalizedId.toLowerCase());
    }

    if (!isAdmin) {
        query = query.eq("is_active", true);
    }

    const { data: service, error } = await query.maybeSingle();

    if (error) {
        return next(new ApiError("Failed to retrieve service", 500));
    }

    if (!service) {
        return next(new ApiError("Service not found", 404));
    }

    // 3. Cache service for public users
    if (!isAdmin) {
        await setCache(cacheKey, service, CACHE_TTL.SERVICES);
        if (service.id !== normalizedId) {
            await setCache(CACHE_KEYS.SERVICE(service.id), service, CACHE_TTL.SERVICES);
        }
        if (service.slug && service.slug !== normalizedId.toLowerCase()) {
            await setCache(CACHE_KEYS.SERVICE(service.slug), service, CACHE_TTL.SERVICES);
        }
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "Service retrieved successfully",
        results: service,
    });
});
