import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { paginate, paginationResult } from "../../utils/pagination.js";
import { sendSuccess } from "../../utils/response.js";
import { getCache, setCache } from "../../services/cache.service.js";
import { CACHE_KEYS, CACHE_TTL } from "../../config/cache.js";

// @Desc Get list of technologies for public use (active only)
// @Route GET /api/technologies
// @Access Public
export const getTechnologies = AsyncHandler(async (req, res, next) => {
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
    const { page, limit, from, to } = paginate(req);

    const isAdmin = Boolean(req.isAdmin);
    const cacheKey = hasPagination
        ? `${CACHE_KEYS.TECHNOLOGIES}:page:${page}:limit:${limit}`
        : CACHE_KEYS.TECHNOLOGIES;

    // 1. Try reading from cache (public only)
    if (!isAdmin) {
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return sendSuccess(res, {
                statusCode: 200,
                message: "Technologies retrieved successfully",
                ...(cachedData.pagination ? { pagination: cachedData.pagination } : {}),
                results: cachedData.results,
            });
        }
    }

    // 2. Build Supabase query
    let query = supabase
        .from("technologies")
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

    const { data: technologies, error, count } = await query;

    if (error) {
        return next(new ApiError("Failed to fetch technologies", 500));
    }

    const results = technologies || [];
    const pagination = hasPagination ? paginationResult(page, limit, count || 0) : undefined;

    // 3. Cache the results for public requests only
    if (!isAdmin) {
        await setCache(cacheKey, { results, ...(pagination ? { pagination } : {}) }, CACHE_TTL.TECHNOLOGIES);
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "Technologies retrieved successfully",
        ...(pagination ? { pagination } : {}),
        results,
    });
});
