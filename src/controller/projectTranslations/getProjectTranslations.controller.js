import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Get all translations for a project
// @Route GET /api/projects/:projectId/translations
// @Access Public (for published projects) / Private (for all projects)
export const getProjectTranslations = AsyncHandler(async (req, res, next) => {
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

    // Public users can only read translations of published projects
    if (project.status !== "published" && !req.isAdmin) {
        return next(new ApiError("Project not found", 404));
    }

    const { data: translations, error: transError } = await supabase
        .from("project_translations")
        .select("*")
        .eq("project_id", projectId)
        .order("locale", { ascending: true });

    if (transError) {
        return next(new ApiError("Failed to fetch project translations", 500));
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "Project translations retrieved successfully",
        results: translations || [],
    });
});
