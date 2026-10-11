import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Get all categories linked to a project
// @Route GET /api/projects/:projectId/categories
// @Access Public (for published projects) / Private (for all projects)
export const getProjectCategories = AsyncHandler(async (req, res, next) => {
    const { projectId } = req.params;

    if (!projectId || !UUID_REGEX.test(projectId)) {
        return next(new ApiError("Invalid project ID format", 400));
    }

    // Check project existence and status
    const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id, status")
        .eq("id", projectId)
        .maybeSingle();

    if (projectError) {
        return next(new ApiError("An error occurred while fetching project", 500));
    }

    if (!project) {
        return next(new ApiError("Project not found", 404));
    }

    // Public users can only view categories of published projects
    if (project.status !== "published" && !req.isAdmin) {
        return next(new ApiError("Project not found", 404));
    }

    const { data: projectCategories, error: catError } = await supabase
        .from("project_categories")
        .select(`
            project_id,
            category_id,
            categories (
                id,
                name,
                slug,
                sort_order,
                is_active,
                created_at,
                updated_at
            )
        `)
        .eq("project_id", projectId);

    if (catError) {
        return next(new ApiError("Failed to fetch project categories", 500));
    }

    const results = (projectCategories || [])
        .map((pc) => pc.categories)
        .filter((category) => Boolean(category) && (req.isAdmin || category.is_active))
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    return sendSuccess(res, {
        statusCode: 200,
        message: "Project categories retrieved successfully",
        results,
    });
});
