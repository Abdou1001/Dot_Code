import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteByPattern } from "../../services/cache.service.js";

// @Desc Create new project
// @Route POST /api/projects
// @Access Private (Admin only)
export const createProject = AsyncHandler(async (req, res, next) => {
    const {
        slug,
        status = "draft",
        featured = false,
        sort_order = 0,
        live_url = null,
        github_url = null,
    } = req.body;

    const normalizedSlug = slug.trim().toLowerCase();

    // Check if slug already exists
    const { data: existingProject, error: checkError } = await supabase
        .from("projects")
        .select("id")
        .eq("slug", normalizedSlug)
        .maybeSingle();

    if (checkError) {
        return next(new ApiError("An error occurred while validating project data", 500));
    }

    if (existingProject) {
        return next(new ApiError("A project with this slug already exists", 409));
    }

    const { data: newProject, error: insertError } = await supabase
        .from("projects")
        .insert({
            slug: normalizedSlug,
            status,
            featured: Boolean(featured),
            sort_order: Number(sort_order) || 0,
            live_url: live_url || null,
            github_url: github_url || null,
        })
        .select()
        .single();

    if (insertError || !newProject) {
        return next(new ApiError("Failed to create project", 500));
    }

    // Invalidate project list cache
    await deleteByPattern("projects:*");

    return sendSuccess(res, {
        statusCode: 201,
        message: "Project created successfully",
        results: newProject,
    });
});
