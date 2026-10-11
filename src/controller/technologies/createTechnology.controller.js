import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";

// @Desc Create new technology
// @Route POST /api/technologies
// @Access Private (Admin only)
export const createTechnology = AsyncHandler(async (req, res, next) => {
    const {
        name,
        slug,
        icon = null,
        sort_order = 0,
        is_active = true,
    } = req.body;

    const normalizedSlug = slug.trim().toLowerCase();

    // Check if slug already exists
    const { data: existingTech, error: checkError } = await supabase
        .from("technologies")
        .select("id")
        .eq("slug", normalizedSlug)
        .maybeSingle();

    if (checkError) {
        return next(new ApiError("An error occurred while validating technology data", 500));
    }

    if (existingTech) {
        return next(new ApiError("A technology with this slug already exists", 409));
    }

    const { data: newTech, error: insertError } = await supabase
        .from("technologies")
        .insert({
            name: name.trim(),
            slug: normalizedSlug,
            icon: icon || null,
            sort_order: Number(sort_order) || 0,
            is_active: Boolean(is_active),
        })
        .select()
        .single();

    if (insertError || !newTech) {
        return next(new ApiError("Failed to create technology", 500));
    }

    // Invalidate public technologies cache
    await deleteCache(CACHE_KEYS.TECHNOLOGIES);
    await deleteByPattern("technologies:*");

    return sendSuccess(res, {
        statusCode: 201,
        message: "Technology created successfully",
        results: newTech,
    });
});
