import { supabase } from "../../config/supabase.js";
import { STORAGE_BUCKETS } from "../../config/storage.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteByPattern } from "../../services/cache.service.js";
import { UUID_REGEX } from "../../utils/uuid.js";
import { deleteImage } from "../../services/storage.service.js";

// @Desc Delete project image
// @Route DELETE /api/projects/:projectId/images/:id
// @Access Private (Admin only)
export const deleteProjectImage = AsyncHandler(async (req, res, next) => {
    const { projectId, id } = req.params;

    if (!projectId || !UUID_REGEX.test(projectId)) {
        return next(new ApiError("Invalid project ID format", 400));
    }

    if (!id || !UUID_REGEX.test(id)) {
        return next(new ApiError("Invalid image ID format", 400));
    }

    // Check if image exists
    const { data: existingImage, error: findError } = await supabase
        .from("project_images")
        .select("id, image_url")
        .eq("id", id)
        .eq("project_id", projectId)
        .maybeSingle();

    if (findError) {
        return next(new ApiError("An error occurred while fetching project image", 500));
    }

    if (!existingImage) {
        return next(new ApiError("Project image not found", 404));
    }

    // Delete database record
    const { error: deleteError } = await supabase
        .from("project_images")
        .delete()
        .eq("id", id);

    if (deleteError) {
        return next(new ApiError("Failed to delete project image", 500));
    }

    // Delete related image from storage using existing deleteImage service
    if (existingImage.image_url) {
        try {
            await deleteImage(STORAGE_BUCKETS.PROJECTS, existingImage.image_url);
        } catch {
            // Storage deletion failure does not revert database deletion
        }
    }

    // Invalidate project cache patterns
    await deleteByPattern("projects:*");

    return sendSuccess(res, {
        statusCode: 200,
        message: "Project image deleted successfully",
    });
});
