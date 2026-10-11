import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { paginate, paginationResult } from "../../utils/pagination.js";
import { sendSuccess } from "../../utils/response.js";

// @Desc List recorded visitor events with pagination and filters
// @Route GET /api/visitor-events/dashboard/events
// @Access Private (Admin only)
export const getVisitorEventsList = AsyncHandler(async (req, res, next) => {
    const { page, limit, from, to } = paginate(req);
    const { session_id, page_path, device_type, country, from_date, to_date } = req.query;

    let query = supabase
        .from("visitor_events")
        .select("*", { count: "exact" });

    if (session_id && session_id.trim()) {
        query = query.eq("session_id", session_id.trim());
    }

    if (page_path && page_path.trim()) {
        query = query.ilike("page_path", `%${page_path.trim()}%`);
    }

    if (device_type && device_type.trim()) {
        query = query.eq("device_type", device_type.trim().toLowerCase());
    }

    if (country && country.trim()) {
        query = query.ilike("country", `%${country.trim()}%`);
    }

    if (from_date && from_date.trim()) {
        query = query.gte("created_at", from_date.trim());
    }

    if (to_date && to_date.trim()) {
        query = query.lte("created_at", to_date.trim());
    }

    const { data: events, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {
        return next(new ApiError("Failed to fetch visitor events", 500));
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "Visitor events retrieved successfully",
        pagination: paginationResult(page, limit, count || 0),
        results: events || [],
    });
});
