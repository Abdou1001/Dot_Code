import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Delete technology
// @Route DELETE /api/technologies/:id
// @Access Private (Admin only)
export const deleteTechnology = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id || !UUID_REGEX.test(id)) {
        return next(new ApiError("Invalid technology ID format", 400));
    }

    // Check if technology exists
    const { data: existingTech, error: findError } = await supabase
        .from("technologies")
        .select("id, slug")
        .eq("id", id)
        .maybeSingle();

    if (findError) {
        return next(new ApiError("An error occurred while checking technology existence", 500));
    }

    if (!existingTech) {
        return next(new ApiError("Technology not found", 404));
    }

    // Clean up project_technologies junction records if any
    await supabase.from("project_technologies").delete().eq("technology_id", id);

    // Delete technology
    const { error: deleteError } = await supabase
        .from("technologies")
        .delete()
        .eq("id", id);

    if (deleteError) {
        return next(new ApiError("Failed to delete technology", 500));
    }

    // Invalidate cached single technology and list patterns
    await deleteCache(CACHE_KEYS.TECHNOLOGY(existingTech.id));
    if (existingTech.slug) {
        await deleteCache(CACHE_KEYS.TECHNOLOGY(existingTech.slug));
    }
    await deleteCache(CACHE_KEYS.TECHNOLOGIES);
    await deleteByPattern("technologies:*");

    return sendSuccess(res, {
        statusCode: 200,
        message: "Technology deleted successfully",
    });
});
