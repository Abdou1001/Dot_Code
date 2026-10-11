import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Update existing project
// @Route PUT /api/projects/:id
// @Access Private (Admin only)
export const updateProject = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id || !UUID_REGEX.test(id)) {
        return next(new ApiError("Invalid project ID format", 400));
    }

    // Check if project exists
    const { data: existingProject, error: findError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (findError) {
        return next(new ApiError("An error occurred while fetching the project", 500));
    }

    if (!existingProject) {
        return next(new ApiError("Project not found", 404));
    }

    const updateData = {
        updated_at: new Date().toISOString(),
    };

    if (req.body.slug !== undefined) {
        const normalizedSlug = req.body.slug.trim().toLowerCase();

        // Check if slug is used by another project
        const { data: duplicateSlug, error: slugCheckError } = await supabase
            .from("projects")
            .select("id")
            .eq("slug", normalizedSlug)
            .neq("id", id)
            .maybeSingle();

        if (slugCheckError) {
            return next(new ApiError("An error occurred while validating project data", 500));
        }

        if (duplicateSlug) {
            return next(new ApiError("A project with this slug already exists", 409));
        }

        updateData.slug = normalizedSlug;
    }

    if (req.body.status !== undefined) {
        updateData.status = req.body.status;
    }

    if (req.body.featured !== undefined) {
        updateData.featured = Boolean(req.body.featured);
    }

    if (req.body.sort_order !== undefined) {
        updateData.sort_order = Number(req.body.sort_order) || 0;
    }

    if (req.body.live_url !== undefined) {
        updateData.live_url = req.body.live_url || null;
    }

    if (req.body.github_url !== undefined) {
        updateData.github_url = req.body.github_url || null;
    }

    const { data: updatedProject, error: updateError } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (updateError || !updatedProject) {
        return next(new ApiError("Failed to update project", 500));
    }

    // Invalidate cached single project and list patterns
    await deleteCache(CACHE_KEYS.PROJECT(existingProject.slug));
    if (updateData.slug && updateData.slug !== existingProject.slug) {
        await deleteCache(CACHE_KEYS.PROJECT(updateData.slug));
    }
    await deleteByPattern("projects:*");

    return sendSuccess(res, {
        statusCode: 200,
        message: "Project updated successfully",
        results: updatedProject,
    });
});
