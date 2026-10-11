import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Delete category
// @Route DELETE /api/categories/:id
// @Access Private (Admin only)
export const deleteCategory = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id || !UUID_REGEX.test(id)) {
        return next(new ApiError("Invalid category ID format", 400));
    }

    // Check if category exists
    const { data: existingCategory, error: findError } = await supabase
        .from("categories")
        .select("id, slug")
        .eq("id", id)
        .maybeSingle();

    if (findError) {
        return next(new ApiError("An error occurred while checking category existence", 500));
    }

    if (!existingCategory) {
        return next(new ApiError("Category not found", 404));
    }

    // Clean up project_categories junction records if any
    await supabase.from("project_categories").delete().eq("category_id", id);

    // Delete category
    const { error: deleteError } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

    if (deleteError) {
        return next(new ApiError("Failed to delete category", 500));
    }

    // Invalidate cached single category and list patterns
    await deleteCache(CACHE_KEYS.CATEGORY(existingCategory.id));
    if (existingCategory.slug) {
        await deleteCache(CACHE_KEYS.CATEGORY(existingCategory.slug));
    }
    await deleteCache(CACHE_KEYS.CATEGORIES);
    await deleteByPattern("categories:*");

    return sendSuccess(res, {
        statusCode: 200,
        message: "Category deleted successfully",
    });
});
