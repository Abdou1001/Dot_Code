import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Update existing service
// @Route PUT /api/services/:id
// @Access Private (Admin only)
export const updateService = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id || !UUID_REGEX.test(id)) {
        return next(new ApiError("Invalid service ID format", 400));
    }

    // Check if service exists
    const { data: existingService, error: findError } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (findError) {
        return next(new ApiError("An error occurred while fetching the service", 500));
    }

    if (!existingService) {
        return next(new ApiError("Service not found", 404));
    }

    const updateData = {
        updated_at: new Date().toISOString(),
    };

    if (req.body.slug !== undefined) {
        const normalizedSlug = req.body.slug.trim().toLowerCase();

        // Check if slug is used by another service
        const { data: duplicateSlug, error: slugCheckError } = await supabase
            .from("services")
            .select("id")
            .eq("slug", normalizedSlug)
            .neq("id", id)
            .maybeSingle();

        if (slugCheckError) {
            return next(new ApiError("An error occurred while validating service data", 500));
        }

        if (duplicateSlug) {
            return next(new ApiError("A service with this slug already exists", 409));
        }

        updateData.slug = normalizedSlug;
    }

    if (req.body.icon !== undefined) {
        updateData.icon = req.body.icon || null;
    }

    if (req.body.sort_order !== undefined) {
        updateData.sort_order = Number(req.body.sort_order) || 0;
    }

    if (req.body.is_active !== undefined) {
        updateData.is_active = Boolean(req.body.is_active);
    }

    const { data: updatedService, error: updateError } = await supabase
        .from("services")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (updateError || !updatedService) {
        return next(new ApiError("Failed to update service", 500));
    }

    // Invalidate cached single service and list patterns
    await deleteCache(CACHE_KEYS.SERVICE(existingService.id));
    if (existingService.slug) {
        await deleteCache(CACHE_KEYS.SERVICE(existingService.slug));
    }
    if (updateData.slug && updateData.slug !== existingService.slug) {
        await deleteCache(CACHE_KEYS.SERVICE(updateData.slug));
    }
    await deleteCache(CACHE_KEYS.SERVICES);
    await deleteByPattern("services:*");

    return sendSuccess(res, {
        statusCode: 200,
        message: "Service updated successfully",
        results: updatedService,
    });
});
