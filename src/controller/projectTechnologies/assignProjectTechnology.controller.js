import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Assign technology to a project
// @Route POST /api/projects/:projectId/technologies
// @Access Private (Admin only)
export const assignProjectTechnology = AsyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const technologyId = req.body.technology_id || req.body.technologyId;

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
        return next(new ApiError("An error occurred while validating project data", 500));
    }

    if (!project) {
        return next(new ApiError("Project not found", 404));
    }

    // 2. Check if technology exists
    const { data: technology, error: techError } = await supabase
        .from("technologies")
        .select("id, name, slug, icon, sort_order, is_active")
        .eq("id", technologyId)
        .maybeSingle();

    if (techError) {
        return next(new ApiError("An error occurred while validating technology data", 500));
    }

    if (!technology) {
        return next(new ApiError("Technology not found", 404));
    }

    // 3. Prevent duplicate relationship
    const { data: existingRelation, error: checkError } = await supabase
        .from("project_technologies")
        .select("project_id, technology_id")
        .eq("project_id", projectId)
        .eq("technology_id", technologyId)
        .maybeSingle();

    if (checkError) {
        return next(new ApiError("An error occurred while checking project technology relationship", 500));
    }

    if (existingRelation) {
        return next(new ApiError("This technology is already assigned to the project", 409));
    }

    // 4. Assign technology
    const { data: newRelation, error: insertError } = await supabase
        .from("project_technologies")
        .insert({
            project_id: projectId,
            technology_id: technologyId,
        })
        .select()
        .single();

    if (insertError || !newRelation) {
        return next(new ApiError("Failed to assign technology to project", 500));
    }

    // 5. Invalidate project caches
    await deleteCache(CACHE_KEYS.PROJECT(project.slug));
    await deleteByPattern("projects:*");

    return sendSuccess(res, {
        statusCode: 201,
        message: "Technology assigned to project successfully",
        results: technology,
    });
});
