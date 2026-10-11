import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { paginate, paginationResult } from "../../utils/pagination.js";
import { sendSuccess } from "../../utils/response.js";

// @Desc Get all services for admin dashboard
// @Route GET /api/services/dashboard
// @Access Private (Admin only)
export const getAdminServices = AsyncHandler(async (req, res, next) => {
    const { page, limit, from, to } = paginate(req);
    const { is_active, search } = req.query;

    let query = supabase
        .from("services")
        .select("*", { count: "exact" });

    // Optional active filter
    if (is_active !== undefined && (is_active === "true" || is_active === "false")) {
        query = query.eq("is_active", is_active === "true");
    }

    // Optional search filter by slug
    if (search && search.trim()) {
        const searchTerm = search.trim();
        query = query.ilike("slug", `%${searchTerm}%`);
    }

    const { data: services, error, count } = await query
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {
        return next(new ApiError("Failed to fetch dashboard services", 500));
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "Dashboard services retrieved successfully",
        pagination: paginationResult(page, limit, count || 0),
        results: services || [],
    });
});
