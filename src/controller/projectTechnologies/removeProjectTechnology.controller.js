import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Remove technology from a project
// @Route DELETE /api/projects/:projectId/technologies/:technologyId
// @Access Private (Admin only)
export const removeProjectTechnology = AsyncHandler(async (req, res, next) => {
    const { projectId, technologyId } = req.params;

    if (!projectId || !UUID_REGEX.test(projectId)) {
        return next(new ApiError("Invalid project ID format", 400));
    }

    if (!technologyId || !UUID_REGEX.test(technologyId)) {
        return next(new ApiError("Invalid technology ID format", 400));
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
        .from("project_technologies")
        .select("project_id, technology_id")
        .eq("project_id", projectId)
        .eq("technology_id", technologyId)
        .maybeSingle();

    if (findError) {
        return next(new ApiError("An error occurred while checking relation existence", 500));
    }

    if (!existingRelation) {
        return next(new ApiError("Technology assignment not found for this project", 404));
    }

    // 3. Delete relation
    const { error: deleteError } = await supabase
        .from("project_technologies")
        .delete()
        .eq("project_id", projectId)
        .eq("technology_id", technologyId);

    if (deleteError) {
        return next(new ApiError("Failed to remove technology from project", 500));
    }

    // 4. Invalidate project caches
    await deleteCache(CACHE_KEYS.PROJECT(project.slug));
    await deleteByPattern("projects:*");

    return sendSuccess(res, {
        statusCode: 200,
        message: "Technology removed from project successfully",
    });
});
