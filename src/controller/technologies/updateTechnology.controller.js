import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Update existing technology
// @Route PUT /api/technologies/:id
// @Access Private (Admin only)
export const updateTechnology = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id || !UUID_REGEX.test(id)) {
        return next(new ApiError("Invalid technology ID format", 400));
    }

    // Check if technology exists
    const { data: existingTech, error: findError } = await supabase
        .from("technologies")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (findError) {
        return next(new ApiError("An error occurred while fetching the technology", 500));
    }

    if (!existingTech) {
        return next(new ApiError("Technology not found", 404));
    }

    const updateData = {
        updated_at: new Date().toISOString(),
    };

    if (req.body.name !== undefined) {
        updateData.name = req.body.name.trim();
    }

    if (req.body.slug !== undefined) {
        const normalizedSlug = req.body.slug.trim().toLowerCase();

        // Check if slug is used by another technology
        const { data: duplicateSlug, error: slugCheckError } = await supabase
            .from("technologies")
            .select("id")
            .eq("slug", normalizedSlug)
            .neq("id", id)
            .maybeSingle();

        if (slugCheckError) {
            return next(new ApiError("An error occurred while validating technology data", 500));
        }

        if (duplicateSlug) {
            return next(new ApiError("A technology with this slug already exists", 409));
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

    const { data: updatedTech, error: updateError } = await supabase
        .from("technologies")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (updateError || !updatedTech) {
        return next(new ApiError("Failed to update technology", 500));
    }

    // Invalidate cached single technology and list patterns
    await deleteCache(CACHE_KEYS.TECHNOLOGY(existingTech.id));
    if (existingTech.slug) {
        await deleteCache(CACHE_KEYS.TECHNOLOGY(existingTech.slug));
    }
    if (updateData.slug && updateData.slug !== existingTech.slug) {
        await deleteCache(CACHE_KEYS.TECHNOLOGY(updateData.slug));
    }
    await deleteCache(CACHE_KEYS.TECHNOLOGIES);
    await deleteByPattern("technologies:*");

    return sendSuccess(res, {
        statusCode: 200,
        message: "Technology updated successfully",
        results: updatedTech,
    });
});
