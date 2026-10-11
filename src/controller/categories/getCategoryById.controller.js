import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { getCache, setCache } from "../../services/cache.service.js";
import { CACHE_KEYS, CACHE_TTL } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Get one category by ID or slug
// @Route GET /api/categories/:id
// @Access Public
export const getCategoryById = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new ApiError("Category identifier is required", 400));
    }

    const normalizedId = id.trim();
    const isUuid = UUID_REGEX.test(normalizedId);
    const isAdmin = Boolean(req.isAdmin);
    const cacheKey = CACHE_KEYS.CATEGORY(normalizedId.toLowerCase());

    // 1. Try reading from cache (public only)
    if (!isAdmin) {
        const cachedCategory = await getCache(cacheKey);
        if (cachedCategory) {
            return sendSuccess(res, {
                statusCode: 200,
                message: "Category retrieved successfully",
                results: cachedCategory,
            });
        }
    }

    // 2. Query Supabase
    let query = supabase.from("categories").select("*");

    if (isUuid) {
        query = query.eq("id", normalizedId);
    } else {
        query = query.eq("slug", normalizedId.toLowerCase());
    }

    if (!isAdmin) {
        query = query.eq("is_active", true);
    }

    const { data: category, error } = await query.maybeSingle();

    if (error) {
        return next(new ApiError("Failed to retrieve category", 500));
    }

    if (!category) {
        return next(new ApiError("Category not found", 404));
    }

    // 3. Cache category for public users
    if (!isAdmin) {
        await setCache(cacheKey, category, CACHE_TTL.CATEGORIES);
        if (category.id !== normalizedId) {
            await setCache(CACHE_KEYS.CATEGORY(category.id), category, CACHE_TTL.CATEGORIES);
        }
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "Category retrieved successfully",
        results: category,
    });
});
