import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Get translation of a project for a specific locale (ar or en)
// @Route GET /api/projects/:projectId/translations/:locale
// @Access Public (for published projects) / Private (for all projects)
export const getProjectTranslationByLocale = AsyncHandler(async (req, res, next) => {
    const { projectId, locale } = req.params;

    if (!projectId || !UUID_REGEX.test(projectId))
        return next(new ApiError("Invalid project ID format", 400));


    const normalizedLocale = (locale || "").toLowerCase().trim();

    if (!["ar", "en"].includes(normalizedLocale))
        return next(new ApiError("Locale must be either 'ar' or 'en'", 400));


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

    const { data: translation, error: transError } = await supabase
        .from("project_translations")
        .select("*")
        .eq("project_id", projectId)
        .eq("locale", normalizedLocale)
        .maybeSingle();

    if (transError) {
        return next(new ApiError("Failed to fetch project translation", 500));
    }

    if (!translation) {
        return next(new ApiError(`Translation for locale '${normalizedLocale}' not found`, 404));
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "Project translation retrieved successfully",
        results: translation,
    });
});
