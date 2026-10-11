import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Get one image for a project
// @Route GET /api/projects/:projectId/images/:id
// @Access Public (for published projects) / Private (for all projects)
export const getProjectImageById = AsyncHandler(async (req, res, next) => {
    const { projectId, id } = req.params;

    if (!projectId || !UUID_REGEX.test(projectId)) {
        return next(new ApiError("Invalid project ID format", 400));
    }

    if (!id || !UUID_REGEX.test(id)) {
        return next(new ApiError("Invalid image ID format", 400));
    }

    // Check project existence and status
    const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id, status")
        .eq("id", projectId)
        .maybeSingle();

    if (projectError) {
        return next(new ApiError("An error occurred while fetching project", 500));
    }

    if (!project) {
        return next(new ApiError("Project not found", 404));
    }

    // Public users can only view images of published projects
    if (project.status !== "published" && !req.isAdmin) {
        return next(new ApiError("Project not found", 404));
    }

    const { data: image, error: imageError } = await supabase
        .from("project_images")
        .select("*")
        .eq("id", id)
        .eq("project_id", projectId)
        .maybeSingle();

    if (imageError) {
        return next(new ApiError("Failed to fetch project image", 500));
    }

    if (!image) {
        return next(new ApiError("Project image not found", 404));
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "Project image retrieved successfully",
        results: image,
    });
});
