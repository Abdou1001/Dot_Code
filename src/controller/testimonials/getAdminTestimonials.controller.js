import { supabase } from "../../config/supabase.js";
import { STORAGE_BUCKETS } from "../../config/storage.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { paginate, paginationResult } from "../../utils/pagination.js";
import { sendSuccess } from "../../utils/response.js";
import { formatRecordImages } from "../../services/image.service.js";

// @Desc Get all testimonials for admin dashboard
// @Route GET /api/testimonials/dashboard
// @Access Private (Admin only)
export const getAdminTestimonials = AsyncHandler(async (req, res, next) => {
    const { page, limit, from, to } = paginate(req);
    const { is_published, is_featured, search } = req.query;

    let query = supabase
        .from("testimonials")
        .select("*", { count: "exact" });

    // Optional published filter
    if (is_published !== undefined && (is_published === "true" || is_published === "false")) {
        query = query.eq("is_published", is_published === "true");
    }

    // Optional featured filter
    if (is_featured !== undefined && (is_featured === "true" || is_featured === "false")) {
        query = query.eq("is_featured", is_featured === "true");
    }

    // Optional search filter by client_name or company
    if (search && search.trim()) {
        const searchTerm = search.trim();
        query = query.or(`client_name.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`);
    }

    const { data: testimonials, error, count } = await query
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {
        return next(new ApiError("Failed to fetch dashboard testimonials", 500));
    }

    const formattedTestimonials = formatRecordImages(
        STORAGE_BUCKETS.TESTIMONIALS,
        testimonials || [],
        "client_image"
    );

    return sendSuccess(res, {
        statusCode: 200,
        message: "Dashboard testimonials retrieved successfully",
        pagination: paginationResult(page, limit, count || 0),
        results: formattedTestimonials,
    });
});

