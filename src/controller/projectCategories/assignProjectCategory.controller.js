import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Assign category to a project
// @Route POST /api/projects/:projectId/categories
// @Access Private (Admin only)
export const assignProjectCategory = AsyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const categoryId = req.body.category_id || req.body.categoryId;

    if (!projectId || !UUID_REGEX.test(projectId)) {
        return next(new ApiError("Invalid project ID format", 400));
    }

    if (!categoryId || !UUID_REGEX.test(categoryId)) {
        return next(new ApiError("Invalid category ID format", 400));
    }

    // 1. Check if project exists
    const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id, slug")
        .eq("id", projectId)
        .maybeSingle();

    if (projectError) {
        return next(new ApiError("An error occurred while validating project data", 500));
    }

    if (!project) {
        return next(new ApiError("Project not found", 404));
    }

    // 2. Check if category exists
    const { data: category, error: catError } = await supabase
        .from("categories")
        .select("id, name, slug, sort_order, is_active")
        .eq("id", categoryId)
        .maybeSingle();

    if (catError) {
        return next(new ApiError("An error occurred while validating category data", 500));
    }

    if (!category) {
        return next(new ApiError("Category not found", 404));
    }

    // 3. Prevent duplicate relationship
    const { data: existingRelation, error: checkError } = await supabase
        .from("project_categories")
        .select("project_id, category_id")
        .eq("project_id", projectId)
        .eq("category_id", categoryId)
        .maybeSingle();

    if (checkError) {
        return next(new ApiError("An error occurred while checking project category relationship", 500));
    }

    if (existingRelation) {
        return next(new ApiError("This category is already assigned to the project", 409));
    }

    // 4. Assign category
    const { data: newRelation, error: insertError } = await supabase
        .from("project_categories")
        .insert({
            project_id: projectId,
            category_id: categoryId,
        })
        .select()
        .single();

    if (insertError || !newRelation) {
        return next(new ApiError("Failed to assign category to project", 500));
    }

    // 5. Invalidate project caches
    await deleteCache(CACHE_KEYS.PROJECT(project.slug));
    await deleteByPattern("projects:*");

    return sendSuccess(res, {
        statusCode: 201,
        message: "Category assigned to project successfully",
        results: category,
    });
});
