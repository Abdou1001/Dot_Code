import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Update project status (draft, published, hidden)
// @Route PATCH /api/projects/:id/status
// @Access Private (Admin only)
export const updateProjectStatus = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !UUID_REGEX.test(id)) {
        return next(new ApiError("Invalid project ID format", 400));
    }

    // Check if project exists
    const { data: existingProject, error: findError } = await supabase
        .from("projects")
        .select("id, slug, status")
        .eq("id", id)
        .maybeSingle();

    if (findError) {
        return next(new ApiError("An error occurred while fetching the project", 500));
    }

    if (!existingProject) {
        return next(new ApiError("Project not found", 404));
    }

    const { data: updatedProject, error: updateError } = await supabase
        .from("projects")
        .update({
            status,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (updateError || !updatedProject) {
        return next(new ApiError("Failed to update project status", 500));
    }

    // Invalidate cached single project and list patterns
    await deleteCache(CACHE_KEYS.PROJECT(existingProject.slug));
    await deleteByPattern("projects:*");

    return sendSuccess(res, {
        statusCode: 200,
        message: "Project status updated successfully",
        results: updatedProject,
    });
});
