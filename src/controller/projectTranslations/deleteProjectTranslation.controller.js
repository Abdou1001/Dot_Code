import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Delete project translation for a specific locale
// @Route DELETE /api/projects/:projectId/translations/:locale
// @Access Private (Admin only)
export const deleteProjectTranslation = AsyncHandler(async (req, res, next) => {
    const { projectId, locale } = req.params;

    // Validate project ID format
    if (!projectId || !UUID_REGEX.test(projectId)) {
        return next(new ApiError("Invalid project ID format", 400));
    }

    // Validate locale format
    const normalizedLocale = (locale || "").toLowerCase().trim();
    if (!["ar", "en"].includes(normalizedLocale)) {
        return next(new ApiError("Locale must be either 'ar' or 'en'", 400));
    }

    // Check project existence (without deleting the project itself)
    const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id, slug")
        .eq("id", projectId)
        .maybeSingle();

    if (projectError) {
        return next(new ApiError("An error occurred while checking project existence", 500));
    }

    if (!project) {
        return next(new ApiError("Project not found", 404));
    }

    // Check if the specific translation exists
    const { data: existingTranslation, error: findTransError } = await supabase
        .from("project_translations")
        .select("id")
        .eq("project_id", projectId)
        .eq("locale", normalizedLocale)
        .maybeSingle();

    if (findTransError) {
        return next(new ApiError("An error occurred while checking translation existence", 500));
    }

    if (!existingTranslation) {
        return next(new ApiError(`Translation for locale '${normalizedLocale}' not found`, 404));
    }

    // Delete only the translation row
    const { error: deleteError } = await supabase
        .from("project_translations")
        .delete()
        .eq("project_id", projectId)
        .eq("locale", normalizedLocale);

    if (deleteError) {
        return next(new ApiError("Failed to delete project translation", 500));
    }

    // Invalidate related Redis cache keys
    await deleteCache(`${CACHE_KEYS.PROJECT(project.slug)}:locale:${normalizedLocale}`);
    await deleteCache(CACHE_KEYS.PROJECT(project.slug));
    await deleteByPattern("projects:*");

    return sendSuccess(res, {
        statusCode: 200,
        message: "Project translation deleted successfully",
    });
});
