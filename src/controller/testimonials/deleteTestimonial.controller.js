import { supabase } from "../../config/supabase.js";
import { STORAGE_BUCKETS } from "../../config/storage.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";
import { deleteImage } from "../../services/storage.service.js";

// @Desc Delete testimonial
// @Route DELETE /api/testimonials/:id
// @Access Private (Admin only)
export const deleteTestimonial = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id || !UUID_REGEX.test(id)) {
        return next(new ApiError("Invalid testimonial ID format", 400));
    }

    // Check if testimonial exists
    const { data: existingTestimonial, error: findError } = await supabase
        .from("testimonials")
        .select("id, client_image")
        .eq("id", id)
        .maybeSingle();

    if (findError) {
        return next(new ApiError("An error occurred while checking testimonial existence", 500));
    }

    if (!existingTestimonial) {
        return next(new ApiError("Testimonial not found", 404));
    }

    // Delete testimonial from database
    const { error: deleteError } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", id);

    if (deleteError) {
        return next(new ApiError("Failed to delete testimonial", 500));
    }

    // Delete image from storage if present
    if (existingTestimonial.client_image) {
        try {
            await deleteImage(STORAGE_BUCKETS.TESTIMONIALS, existingTestimonial.client_image);
        } catch {
            // Storage deletion failure does not revert database deletion
        }
    }

    // Invalidate cached single testimonial and list patterns
    await deleteCache(CACHE_KEYS.TESTIMONIAL(id));
    await deleteCache(CACHE_KEYS.TESTIMONIALS);
    await deleteByPattern("testimonials:*");

    return sendSuccess(res, {
        statusCode: 200,
        message: "Testimonial deleted successfully",
    });
});
