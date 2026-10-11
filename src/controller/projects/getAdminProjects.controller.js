import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { paginate, paginationResult } from "../../utils/pagination.js";
import { sendSuccess } from "../../utils/response.js";

// @Desc Get all projects for dashboard (published and drafts)
// @Route GET /api/projects/dashboard
// @Access Private (Admin only)
export const getAdminProjects = AsyncHandler(async (req, res, next) => {
    const { page, limit, from, to } = paginate(req);
    const { status, search } = req.query;

    let query = supabase
        .from("projects")
        .select("*", { count: "exact" });

    // Optional status filter (e.g. ?status=draft, ?status=published, or ?status=hidden)
    if (status && ["draft", "published", "hidden"].includes(status)) {
        query = query.eq("status", status);
    }

    // Optional search filter by slug
    if (search && search.trim()) {
        query = query.ilike("slug", `%${search.trim()}%`);
    }

    // Order by sort_order and creation date
    const { data: projects, error, count } = await query
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {
        return next(new ApiError("Failed to fetch dashboard projects", 500));
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "Dashboard projects retrieved successfully",
        pagination: paginationResult(page, limit, count || 0),
        results: projects || [],
    });
});
