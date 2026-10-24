import { supabase } from "../../config/supabase.js";
import { STORAGE_BUCKETS } from "../../config/storage.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { paginate, paginationResult } from "../../utils/pagination.js";
import { sendSuccess } from "../../utils/response.js";
import { getCache, setCache } from "../../services/cache.service.js";
import { CACHE_KEYS, CACHE_TTL } from "../../config/cache.js";
import { formatRecordImages } from "../../services/image.service.js";

// @Desc Get list of testimonials for public use (published only)
// @Route GET /api/testimonials
// @Access Public
export const getTestimonials = AsyncHandler(async (req, res, next) => {
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
    const { page, limit, from, to } = paginate(req);

    const isAdmin = Boolean(req.isAdmin);
    const cacheKey = hasPagination
        ? `${CACHE_KEYS.TESTIMONIALS}:page:${page}:limit:${limit}`
        : CACHE_KEYS.TESTIMONIALS;

    // 1. Try reading from cache (public only)
    if (!isAdmin) {
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return sendSuccess(res, {
                statusCode: 200,
                message: "Testimonials retrieved successfully",
                ...(cachedData.pagination ? { pagination: cachedData.pagination } : {}),
                results: cachedData.results,
            });
        }
    }

    // 2. Build Supabase query
    let query = supabase
        .from("testimonials")
        .select("*", hasPagination ? { count: "exact" } : undefined);

    if (!isAdmin) {
        query = query.eq("is_published", true);
    }

    // Optional featured filter
    if (req.query.featured !== undefined) {
        query = query.eq("is_featured", req.query.featured === "true");
    }

    query = query
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (hasPagination) {
        query = query.range(from, to);
    }

    const { data: testimonials, error, count } = await query;

    if (error) {
        return next(new ApiError("Failed to fetch testimonials", 500));
    }

    const results = formatRecordImages(
        STORAGE_BUCKETS.TESTIMONIALS,
        testimonials || [],
        "client_image"
    );
    const pagination = hasPagination ? paginationResult(page, limit, count || 0) : undefined;

    // 3. Cache the results for public requests only
    if (!isAdmin) {
        await setCache(cacheKey, { results, ...(pagination ? { pagination } : {}) }, CACHE_TTL.TESTIMONIALS);
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "Testimonials retrieved successfully",
        ...(pagination ? { pagination } : {}),
        results,
    });
});

