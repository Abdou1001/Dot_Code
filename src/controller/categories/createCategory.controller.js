import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";

// @Desc Create new category
// @Route POST /api/categories
// @Access Private (Admin only)
export const createCategory = AsyncHandler(async (req, res, next) => {
    const {
        name,
        name_ar,
        slug,
        sort_order = 0,
        is_active = true,
    } = req.body;

    const normalizedSlug = slug.trim().toLowerCase();

    // Check if slug already exists
    const { data: existingCategory, error: checkError } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", normalizedSlug)
        .maybeSingle();

    if (checkError) {
        return next(new ApiError("An error occurred while validating category data", 500));
    }

    if (existingCategory) {
        return next(new ApiError("A category with this slug already exists", 409));
    }

    const {data: newCategory, error: insertError} = await supabase
        .from("categories")
        .insert({
            name: name.trim(),
            name_ar: name_ar.trim(),
            slug: normalizedSlug,
            sort_order: Number(sort_order) || 0,
            is_active: Boolean(is_active),
        })
        .select()
        .single();

    if (insertError || !newCategory) {
        return next(new ApiError("Failed to create category", 500));
    }

    // Invalidate public categories cache
    await deleteCache(CACHE_KEYS.CATEGORIES);
    await deleteByPattern("categories:*");

    return sendSuccess(res, {
        statusCode: 201,
        message: "Category created successfully",
        results: newCategory,
    });
});
