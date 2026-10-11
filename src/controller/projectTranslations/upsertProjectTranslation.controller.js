import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Create or update project translation
// @Route PUT /api/projects/:projectId/translations/:locale
// @Route POST /api/projects/:projectId/translations
// @Access Private (Admin only)
export const upsertProjectTranslation = AsyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const targetLocale = (req.params.locale || req.body.locale || "").toLowerCase().trim();

    if (!projectId || !UUID_REGEX.test(projectId)) {
        return next(new ApiError("Invalid project ID format", 400));
    }

    if (!["ar", "en"].includes(targetLocale)) {
        return next(new ApiError("Locale must be either 'ar' or 'en'", 400));
    }

    const {
        title,
        description = null,
        role = null,
        challenge = null,
        solution = null,
        result = null,
        meta_title = null,
        meta_description = null,
    } = req.body;

    // Check project existence
    const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .maybeSingle();

    if (projectError) {
        return next(new ApiError("An error occurred while validating project existence", 500));
    }

    if (!project) {
        return next(new ApiError("Project not found", 404));
    }

    // Upsert project translation by (project_id, locale)
    const { data: translation, error: upsertError } = await supabase
        .from("project_translations")
        .upsert(
            {
                project_id: projectId,
                locale: targetLocale,
                title,
                description: description || null,
                role: role || null,
                challenge: challenge || null,
                solution: solution || null,
                result: result || null,
                meta_title: meta_title || null,
                meta_description: meta_description || null,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "project_id,locale" },
        )
        .select()
        .single();

    if (upsertError || !translation) {
        return next(new ApiError("Failed to save project translation", 500));
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "Project translation saved successfully",
        results: translation,
    });
});
