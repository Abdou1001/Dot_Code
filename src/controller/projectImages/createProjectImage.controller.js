import { supabase } from "../../config/supabase.js";
import { STORAGE_BUCKETS } from "../../config/storage.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteByPattern } from "../../services/cache.service.js";
import { UUID_REGEX } from "../../utils/uuid.js";
import {
    uploadAndProcessImage,
    rollbackUploadedImage,
    formatRecordImage,
} from "../../services/image.service.js";

// @Desc Upload and add an image to a project
// @Route POST /api/projects/:projectId/images
// @Access Private (Admin only)
export const createProjectImage = AsyncHandler(async (req, res, next) => {
    const { projectId } = req.params;

    if (!projectId || !UUID_REGEX.test(projectId)) {
        return next(new ApiError("Invalid project ID format", 400));
    }

    if (!req.file) {
        return next(new ApiError("Please upload an image file", 400));
    }

    const { alt, sort_order = 0, is_featured = false } = req.body;

    // Check project existence
    const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .maybeSingle();

    if (projectError) {
        return next(new ApiError("An error occurred while validating project existence", 500));
    }

    if (!project) {
        return next(new ApiError("Project not found", 404));
    }

    // Process and upload image using existing image service
    let uploadedImage = null;
    try {
        uploadedImage = await uploadAndProcessImage(STORAGE_BUCKETS.PROJECTS, req.file);

        const imageUrl = typeof uploadedImage === "string"
            ? uploadedImage
            : uploadedImage?.image_url;

        // Only one image can be is_featured = true for a project
        if (is_featured) {
            await supabase
                .from("project_images")
                .update({ is_featured: false })
                .eq("project_id", projectId);
        }

        const { data: newImage, error: insertError } = await supabase
            .from("project_images")
            .insert({
                project_id: projectId,
                image_url: imageUrl,
                alt: alt || null,
                sort_order: Number(sort_order) || 0,
                is_featured: Boolean(is_featured),
            })
            .select()
            .single();

        if (insertError || !newImage) {
            throw new ApiError("Failed to save project image", 500);
        }

        // Invalidate project cache patterns
        await deleteByPattern("projects:*");

        return sendSuccess(res, {
            statusCode: 201,
            message: "Project image uploaded successfully",
            results: formatRecordImage(STORAGE_BUCKETS.PROJECTS, newImage, "image_url"),
        });
    } catch (error) {
        if (uploadedImage) {
            const fileName = typeof uploadedImage === "string"
                ? uploadedImage
                : (uploadedImage?.fileName || uploadedImage?.path);
            await rollbackUploadedImage(STORAGE_BUCKETS.PROJECTS, fileName);
        }
        return next(error);
    }
});
