import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Update existing category
// @Route PUT /api/categories/:id
// @Access Private (Admin only)
export const updateCategory = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id || !UUID_REGEX.test(id)) {
        return next(new ApiError("Invalid category ID format", 400));
    }

    // Check if category exists
    const { data: existingCategory, error: findError } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (findError) {
        return next(new ApiError("An error occurred while fetching the category", 500));
    }

    if (!existingCategory) {
        return next(new ApiError("Category not found", 404));
    }

    const updateData = {
        updated_at: new Date().toISOString(),
    };

    if (req.body.name !== undefined) {
        updateData.name = req.body.name.trim();
    }

    if (req.body.name_ar !== undefined) {
        updateData.name_ar = req.body.name_ar.trim();
    }

    if (req.body.slug !== undefined) {
        const normalizedSlug = req.body.slug.trim().toLowerCase();

        // Check if slug is used by another category
        const { data: duplicateSlug, error: slugCheckError } = await supabase
            .from("categories")
            .select("id")
            .eq("slug", normalizedSlug)
            .neq("id", id)
            .maybeSingle();

        if (slugCheckError) {
            return next(new ApiError("An error occurred while validating category data", 500));
        }

        if (duplicateSlug) {
            return next(new ApiError("A category with this slug already exists", 409));
        }

        updateData.slug = normalizedSlug;
    }

    if (req.body.sort_order !== undefined) {
        updateData.sort_order = Number(req.body.sort_order) || 0;
    }

    if (req.body.is_active !== undefined) {
        updateData.is_active = Boolean(req.body.is_active);
    }

    const { data: updatedCategory, error: updateError } = await supabase
        .from("categories")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (updateError || !updatedCategory) {
        return next(new ApiError("Failed to update category", 500));
    }

    // Invalidate cached single category and list patterns
    await deleteCache(CACHE_KEYS.CATEGORY(existingCategory.id));
    if (existingCategory.slug) {
        await deleteCache(CACHE_KEYS.CATEGORY(existingCategory.slug));
    }
    if (updateData.slug && updateData.slug !== existingCategory.slug) {
        await deleteCache(CACHE_KEYS.CATEGORY(updateData.slug));
    }
    await deleteCache(CACHE_KEYS.CATEGORIES);
    await deleteByPattern("categories:*");

    return sendSuccess(res, {
        statusCode: 200,
        message: "Category updated successfully",
        results: updatedCategory,
    });
});
