import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";

// @Desc Create new service
// @Route POST /api/services
// @Access Private (Admin only)
export const createService = AsyncHandler(async (req, res, next) => {
    const {
        slug,
        icon = null,
        sort_order = 0,
        is_active = true,
    } = req.body;

    const normalizedSlug = slug.trim().toLowerCase();

    // Check if slug already exists
    const { data: existingService, error: checkError } = await supabase
        .from("services")
        .select("id")
        .eq("slug", normalizedSlug)
        .maybeSingle();

    if (checkError) {
        return next(new ApiError("An error occurred while validating service data", 500));
    }

    if (existingService) {
        return next(new ApiError("A service with this slug already exists", 409));
    }

    const { data: newService, error: insertError } = await supabase
        .from("services")
        .insert({
            slug: normalizedSlug,
            icon: icon || null,
            sort_order: Number(sort_order) || 0,
            is_active: Boolean(is_active),
        })
        .select()
        .single();

    if (insertError || !newService) {
        return next(new ApiError("Failed to create service", 500));
    }

    // Invalidate public services cache
    await deleteCache(CACHE_KEYS.SERVICES);
    await deleteByPattern("services:*");

    return sendSuccess(res, {
        statusCode: 201,
        message: "Service created successfully",
        results: newService,
    });
});
