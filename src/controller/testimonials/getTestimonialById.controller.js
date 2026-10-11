import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { getCache, setCache } from "../../services/cache.service.js";
import { CACHE_KEYS, CACHE_TTL } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Get one testimonial by ID
// @Route GET /api/testimonials/:id
// @Access Public
export const getTestimonialById = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id || !UUID_REGEX.test(id)) {
        return next(new ApiError("Invalid testimonial ID format", 400));
    }

    const isAdmin = Boolean(req.isAdmin);
    const cacheKey = CACHE_KEYS.TESTIMONIAL(id);

    // 1. Try reading from cache (public only)
    if (!isAdmin) {
        const cachedTestimonial = await getCache(cacheKey);
        if (cachedTestimonial) {
            return sendSuccess(res, {
                statusCode: 200,
                message: "Testimonial retrieved successfully",
                results: cachedTestimonial,
            });
        }
    }

    // 2. Query Supabase
    let query = supabase.from("testimonials").select("*").eq("id", id);

    if (!isAdmin) {
        query = query.eq("is_published", true);
    }

    const { data: testimonial, error } = await query.maybeSingle();

    if (error) {
        return next(new ApiError("Failed to retrieve testimonial", 500));
    }

    if (!testimonial) {
        return next(new ApiError("Testimonial not found", 404));
    }

    // 3. Cache testimonial for public users
    if (!isAdmin) {
        await setCache(cacheKey, testimonial, CACHE_TTL.TESTIMONIALS);
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "Testimonial retrieved successfully",
        results: testimonial,
    });
});
