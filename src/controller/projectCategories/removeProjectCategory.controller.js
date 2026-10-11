import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Remove category from a project
// @Route DELETE /api/projects/:projectId/categories/:categoryId
// @Access Private (Admin only)
export const removeProjectCategory = AsyncHandler(async (req, res, next) => {
    const { projectId, categoryId } = req.params;

    if (!projectId || !UUID_REGEX.test(projectId)) {
        return next(new ApiError("Invalid project ID format", 400));
    }

    if (!categoryId || !UUID_REGEX.test(categoryId)) {
        return next(new ApiError("Invalid category ID format", 400));
    }

    // 1. Check if project exists
    const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id, slug")
        .eq("id", projectId)
        .maybeSingle();

    if (projectError) {
        return next(new ApiError("An error occurred while fetching project", 500));
    }

    if (!project) {
        return next(new ApiError("Project not found", 404));
    }

    // 2. Check if relation exists
    const { data: existingRelation, error: findError } = await supabase
        .from("project_categories")
        .select("project_id, category_id")
        .eq("project_id", projectId)
        .eq("category_id", categoryId)
        .maybeSingle();

    if (findError) {
        return next(new ApiError("An error occurred while checking relation existence", 500));
    }

    if (!existingRelation) {
        return next(new ApiError("Category assignment not found for this project", 404));
    }

    // 3. Delete relation
    const { error: deleteError } = await supabase
        .from("project_categories")
        .delete()
        .eq("project_id", projectId)
        .eq("category_id", categoryId);

    if (deleteError) {
        return next(new ApiError("Failed to remove category from project", 500));
    }

    // 4. Invalidate project caches
    await deleteCache(CACHE_KEYS.PROJECT(project.slug));
    await deleteByPattern("projects:*");

    return sendSuccess(res, {
        statusCode: 200,
        message: "Category removed from project successfully",
    });
});
