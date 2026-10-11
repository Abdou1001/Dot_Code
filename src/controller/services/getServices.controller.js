import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { paginate, paginationResult } from "../../utils/pagination.js";
import { sendSuccess } from "../../utils/response.js";
import { getCache, setCache } from "../../services/cache.service.js";
import { CACHE_KEYS, CACHE_TTL } from "../../config/cache.js";

// @Desc Get list of services for public use (active only)
// @Route GET /api/services
// @Access Public
export const getServices = AsyncHandler(async (req, res, next) => {
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
    const { page, limit, from, to } = paginate(req);

    const isAdmin = Boolean(req.isAdmin);
    const cacheKey = hasPagination
        ? `${CACHE_KEYS.SERVICES}:page:${page}:limit:${limit}`
        : CACHE_KEYS.SERVICES;

    // 1. Try reading from cache (public only)
    if (!isAdmin) {
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return sendSuccess(res, {
                statusCode: 200,
                message: "Services retrieved successfully",
                ...(cachedData.pagination ? { pagination: cachedData.pagination } : {}),
                results: cachedData.results,
            });
        }
    }

    // 2. Build Supabase query
    let query = supabase
        .from("services")
        .select("*", hasPagination ? { count: "exact" } : undefined);

    if (!isAdmin) {
        query = query.eq("is_active", true);
    }

    query = query
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (hasPagination) {
        query = query.range(from, to);
    }

    const { data: services, error, count } = await query;

    if (error) {
        return next(new ApiError("Failed to fetch services", 500));
    }

    const results = services || [];
    const pagination = hasPagination ? paginationResult(page, limit, count || 0) : undefined;

    // 3. Cache the results for public requests only
    if (!isAdmin) {
        await setCache(cacheKey, { results, ...(pagination ? { pagination } : {}) }, CACHE_TTL.SERVICES);
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "Services retrieved successfully",
        ...(pagination ? { pagination } : {}),
        results,
    });
});
