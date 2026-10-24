import { supabase } from "../../config/supabase.js";
import { STORAGE_BUCKETS } from "../../config/storage.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteByPattern } from "../../services/cache.service.js";
import { UUID_REGEX } from "../../utils/uuid.js";
import { replaceImage, formatRecordImage } from "../../services/image.service.js";

// @Desc Update project image details (alt, sort_order, is_featured, optional image replace)
// @Route PUT /api/projects/:projectId/images/:id
// @Access Private (Admin only)
export const updateProjectImage = AsyncHandler(async (req, res, next) => {
    const { projectId, id } = req.params;

    if (!projectId || !UUID_REGEX.test(projectId)) {
        return next(new ApiError("Invalid project ID format", 400));
    }

    if (!id || !UUID_REGEX.test(id)) {
        return next(new ApiError("Invalid image ID format", 400));
    }

    const { alt, sort_order, is_featured } = req.body;

    // Check image existence
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

    const updateData = {};
    if (alt !== undefined) updateData.alt = alt || null;
    if (sort_order !== undefined) updateData.sort_order = Number(sort_order);
    if (is_featured !== undefined) updateData.is_featured = Boolean(is_featured);

    if (!req.file && Object.keys(updateData).length === 0) {
        return next(new ApiError("At least one field to update must be provided", 400));
    }

    // Only one image can be is_featured = true for a project
    if (updateData.is_featured === true) {
        await supabase
            .from("project_images")
            .update({ is_featured: false })
            .eq("project_id", projectId)
            .neq("id", id);
    }

    // If a new image is uploaded, use replaceImage
    if (req.file) {
        const updatedImage = await replaceImage({
            bucket: STORAGE_BUCKETS.PROJECTS,
            currentImage: existingImage.image_url,
            file: req.file,
            action: async (newImageResult) => {
                const imageUrl = typeof newImageResult === "string"
                    ? newImageResult
                    : (newImageResult?.imageUrl || newImageResult?.image_url || newImageResult?.fileName);

                updateData.image_url = imageUrl;

                const { data, error } = await supabase
                    .from("project_images")
                    .update(updateData)
                    .eq("id", id)
                    .select()
                    .single();

                if (error || !data) {
                    throw new ApiError("Failed to update project image", 500);
                }

                return data;
            },
        });

        await deleteByPattern("projects:*");

        return sendSuccess(res, {
            statusCode: 200,
            message: "Project image updated successfully",
            results: formatRecordImage(STORAGE_BUCKETS.PROJECTS, updatedImage, "image_url"),
        });
    }

    // If no new image uploaded, update only database fields
    const { data: updatedImage, error: updateError } = await supabase
        .from("project_images")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (updateError || !updatedImage) {
        return next(new ApiError("Failed to update project image", 500));
    }

    // Invalidate project cache patterns
    await deleteByPattern("projects:*");

    return sendSuccess(res, {
        statusCode: 200,
        message: "Project image updated successfully",
        results: formatRecordImage(STORAGE_BUCKETS.PROJECTS, updatedImage, "image_url"),
    });
});
