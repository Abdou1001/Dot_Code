import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { paginate, paginationResult } from "../../utils/pagination.js";
import { sendSuccess } from "../../utils/response.js";
import { getCache, setCache } from "../../services/cache.service.js";
import { CACHE_KEYS, CACHE_TTL } from "../../config/cache.js";
// @Desc Get list of projects (public: published only; admin: draft, published, hidden)
// @Route GET /api/projects?locale=ar|en
// @Access Public / Admin
export const getProjects = AsyncHandler(async (req, res, next) => {
    const { page, limit, from, to } = paginate(req);
    const rawLocale = req.query.locale ? String(req.query.locale).toLowerCase().trim() : null;
    if (rawLocale && !["ar", "en"].includes(rawLocale)) {
        return next(new ApiError("Locale must be either 'ar' or 'en'", 400));
    }
    const validLocale = rawLocale;

    const isAdmin = Boolean(req.isAdmin);
    const cacheKey = `${CACHE_KEYS.PROJECTS_LIST(page, limit)}${validLocale ? `:locale:${validLocale}` : ""}`;

    // 1. Try reading from cache (public only)
    if (!isAdmin) {
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return sendSuccess(res, {
                statusCode: 200,
                message: "Projects retrieved successfully",
                pagination: cachedData.pagination,
                results: cachedData.results,
            });
        }
    }

    // 2. Build select: join translation if locale given
    const selectClause = validLocale
        ? `*, project_translations!inner(title, description, role, challenge, solution, result, meta_title, meta_description, locale)`
        : "*";

    let query = supabase
        .from("projects")
        .select(selectClause, { count: "exact" });

    if (!isAdmin) {
        // Public users can only receive published projects
        query = query.eq("status", "published");
    } else {
        // Admin can receive all statuses (draft, published, hidden), or optionally filter by status
        const { status } = req.query;
        if (status && ["draft", "published", "hidden"].includes(status)) {
            query = query.eq("status", status);
        }
    }

    if (validLocale) {
        query = query.eq("project_translations.locale", validLocale);
    }

    const { data: projects, error, count } = await query
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {
        return next(new ApiError("Failed to fetch projects", 500));
    }

    // Flatten translation into project object when locale requested
    const results = (projects || []).map((p) => {
        if (!validLocale) return p;
        const { project_translations, ...rest } = p;
        const translation = Array.isArray(project_translations)
            ? project_translations[0]
            : project_translations;
        return { ...rest, translation: translation || null };
    });

    const pagination = paginationResult(page, limit, count || 0);

    // 3. Cache the results for public requests only
    if (!isAdmin) {
        await setCache(cacheKey, { pagination, results }, CACHE_TTL.PROJECTS);
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "Projects retrieved successfully",
        pagination,
        results,
    });
});
