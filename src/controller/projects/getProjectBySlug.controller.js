import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { getCache, setCache } from "../../services/cache.service.js";
import { CACHE_KEYS, CACHE_TTL } from "../../config/cache.js";
// @Desc Get project detail by slug (public: published only; admin: draft, published, hidden)
// @Route GET /api/projects/:slug?locale=ar|en
// @Access Public / Admin
export const getProjectBySlug = AsyncHandler(async (req, res, next) => {
    const { slug } = req.params;
    const rawLocale = req.query.locale ? String(req.query.locale).toLowerCase().trim() : null;

    if (rawLocale && !["ar", "en"].includes(rawLocale))
        return next(new ApiError("Locale must be either 'ar' or 'en'", 400));

    const validLocale = rawLocale;

    if (!slug)
        return next(new ApiError("Slug is required", 400));


    const normalizedSlug = slug.trim().toLowerCase();
    const isAdmin = Boolean(req.isAdmin);
    const cacheKey = `${CACHE_KEYS.PROJECT(normalizedSlug)}${validLocale ? `:locale:${validLocale}` : ""}`;

    // 1. Try reading from cache (public only)
    if (!isAdmin) {
        const cachedProject = await getCache(cacheKey);
        if (cachedProject) {
            return sendSuccess(res, {
                statusCode: 200,
                message: "Project retrieved successfully",
                results: cachedProject,
            });
        }
    }

    // 2. Build select: join translation if locale given
    const selectClause = validLocale
        ? `*, project_translations!inner(title, description, role, challenge, solution, result, meta_title, meta_description, locale)`
        : "*";

    let query = supabase
        .from("projects")
        .select(selectClause)
        .eq("slug", normalizedSlug);

    if (!isAdmin) {
        // Public users can only receive published projects
        query = query.eq("status", "published");
    }

    if (validLocale) {
        query = query.eq("project_translations.locale", validLocale);
    }

    const { data: project, error } = await query.maybeSingle();

    if (error) {
        return next(new ApiError("Failed to retrieve project", 500));
    }

    if (!project) {
        return next(new ApiError("Project not found", 404));
    }

    // Flatten translation into project object when locale requested
    let result = project;
    if (validLocale) {
        const { project_translations, ...rest } = project;
        const translation = Array.isArray(project_translations)
            ? project_translations[0]
            : project_translations;
        result = { ...rest, translation: translation || null };
    }

    // 3. Cache project detail for public users
    if (!isAdmin) {
        await setCache(cacheKey, result, CACHE_TTL.PROJECTS);
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "Project retrieved successfully",
        results: result,
    });
});
