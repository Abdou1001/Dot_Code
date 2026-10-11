import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Delete project
// @Route DELETE /api/projects/:id
// @Access Private (Admin only)
export const deleteProject = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id || !UUID_REGEX.test(id)) {
        return next(new ApiError("Invalid project ID format", 400));
    }

    // Check if project exists
    const { data: existingProject, error: findError } = await supabase
        .from("projects")
        .select("id, slug")
        .eq("id", id)
        .maybeSingle();

    if (findError) {
        return next(new ApiError("An error occurred while checking project existence", 500));
    }

    if (!existingProject) {
        return next(new ApiError("Project not found", 404));
    }

    // Safely delete related records according to database relationships
    await supabase.from("project_categories").delete().eq("project_id", id);
    await supabase.from("project_technologies").delete().eq("project_id", id);
    await supabase.from("project_images").delete().eq("project_id", id);
    await supabase.from("project_translations").delete().eq("project_id", id);

    // Delete project
    const { error: deleteError } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);

    if (deleteError) {
        return next(new ApiError("Failed to delete project", 500));
    }

    // Invalidate cached single project and list patterns
    await deleteCache(CACHE_KEYS.PROJECT(existingProject.slug));
    await deleteByPattern("projects:*");

    return sendSuccess(res, {
        statusCode: 200,
        message: "Project deleted successfully",
    });
});
