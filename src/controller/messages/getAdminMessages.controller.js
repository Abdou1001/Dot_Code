import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { paginate, paginationResult } from "../../utils/pagination.js";
import { sendSuccess } from "../../utils/response.js";

// @Desc Get all messages for admin dashboard
// @Route GET /api/messages/dashboard
// @Access Private (Admin only)
export const getAdminMessages = AsyncHandler(async (req, res, next) => {
    const { page, limit, from, to } = paginate(req);
    const { status, search } = req.query;

    let query = supabase
        .from("messages")
        .select("*", { count: "exact" });

    // Optional status filter
    if (status && ["new", "read", "replied", "archived"].includes(status.trim())) {
        query = query.eq("status", status.trim());
    }

    // Optional search filter by name, email, or subject
    if (search && search.trim()) {
        const searchTerm = search.trim();
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%`);
    }

    const { data: messages, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {
        return next(new ApiError("Failed to fetch dashboard messages", 500));
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "Dashboard messages retrieved successfully",
        pagination: paginationResult(page, limit, count || 0),
        results: messages || [],
    });
});
