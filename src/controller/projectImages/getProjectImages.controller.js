import { supabase } from "../../config/supabase.js";
import { STORAGE_BUCKETS } from "../../config/storage.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { UUID_REGEX } from "../../utils/uuid.js";
import { formatRecordImages } from "../../services/image.service.js";

// @Desc Get images for a project
// @Route GET /api/projects/:projectId/images
// @Access Public (for published projects) / Private (for all projects)
export const getProjectImages = AsyncHandler(async (req, res, next) => {
    const { projectId } = req.params;

    if (!projectId || !UUID_REGEX.test(projectId)) {
        return next(new ApiError("Invalid project ID format", 400));
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

    const { data: images, error: imagesError } = await supabase
        .from("project_images")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

    if (imagesError) {
        return next(new ApiError("Failed to fetch project images", 500));
    }

    const formattedImages = formatRecordImages(
        STORAGE_BUCKETS.PROJECTS,
        images || [],
        "image_url"
    );

    return sendSuccess(res, {
        statusCode: 200,
        message: "Project images retrieved successfully",
        results: formattedImages,
    });
});

