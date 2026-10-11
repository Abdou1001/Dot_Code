import { supabase } from "../../config/supabase.js";
import { STORAGE_BUCKETS } from "../../config/storage.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";
import { replaceImage } from "../../services/image.service.js";

// @Desc Update existing testimonial
// @Route PUT /api/testimonials/:id
// @Access Private (Admin only)
export const updateTestimonial = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id || !UUID_REGEX.test(id)) {
        return next(new ApiError("Invalid testimonial ID format", 400));
    }

    // Check if testimonial exists
    const { data: existingTestimonial, error: findError } = await supabase
        .from("testimonials")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (findError) {
        return next(new ApiError("An error occurred while fetching the testimonial", 500));
    }

    if (!existingTestimonial) {
        return next(new ApiError("Testimonial not found", 404));
    }

    const updateData = {
        updated_at: new Date().toISOString(),
    };

    if (req.body.client_name !== undefined) {
        updateData.client_name = req.body.client_name.trim();
    }

    if (req.body.client_role !== undefined) {
        updateData.client_role = req.body.client_role ? req.body.client_role.trim() : null;
    }

    if (req.body.company !== undefined) {
        updateData.company = req.body.company ? req.body.company.trim() : null;
    }

    if (req.body.client_image !== undefined) {
        updateData.client_image = req.body.client_image ? req.body.client_image.trim() : null;
    }

    if (req.body.rating !== undefined) {
        updateData.rating = req.body.rating !== null ? Number(req.body.rating) : null;
    }

    if (req.body.testimonial !== undefined) {
        updateData.testimonial = req.body.testimonial.trim();
    }

    if (req.body.is_featured !== undefined) {
        updateData.is_featured = Boolean(req.body.is_featured);
    }

    if (req.body.is_published !== undefined) {
        updateData.is_published = Boolean(req.body.is_published);
    }

    if (req.body.sort_order !== undefined) {
        updateData.sort_order = Number(req.body.sort_order) || 0;
    }

    // If new image uploaded, replace existing image
    if (req.file) {
        const updated = await replaceImage({
            bucket: STORAGE_BUCKETS.TESTIMONIALS,
            currentImage: existingTestimonial.client_image,
            file: req.file,
            action: async (newImageResult) => {
                const imageUrl = typeof newImageResult === "string"
                    ? newImageResult
                    : (newImageResult?.imageUrl || newImageResult?.image_url || newImageResult?.fileName);

                updateData.client_image = imageUrl;

                const { data, error } = await supabase
                    .from("testimonials")
                    .update(updateData)
                    .eq("id", id)
                    .select()
                    .single();

                if (error || !data) {
                    throw new ApiError("Failed to update testimonial", 500);
                }

                return data;
            },
        });

        // Invalidate cached single testimonial and list patterns
        await deleteCache(CACHE_KEYS.TESTIMONIAL(id));
        await deleteCache(CACHE_KEYS.TESTIMONIALS);
        await deleteByPattern("testimonials:*");

        return sendSuccess(res, {
            statusCode: 200,
            message: "Testimonial updated successfully",
            results: updated,
        });
    }

    const { data: updatedTestimonial, error: updateError } = await supabase
        .from("testimonials")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (updateError || !updatedTestimonial) {
        return next(new ApiError("Failed to update testimonial", 500));
    }

    // Invalidate cached single testimonial and list patterns
    await deleteCache(CACHE_KEYS.TESTIMONIAL(id));
    await deleteCache(CACHE_KEYS.TESTIMONIALS);
    await deleteByPattern("testimonials:*");

    return sendSuccess(res, {
        statusCode: 200,
        message: "Testimonial updated successfully",
        results: updatedTestimonial,
    });
});
