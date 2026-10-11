import { supabase } from "../../config/supabase.js";
import { STORAGE_BUCKETS } from "../../config/storage.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";
import {
    uploadAndProcessImage,
    rollbackUploadedImage,
} from "../../services/image.service.js";

// @Desc Create new testimonial
// @Route POST /api/testimonials
// @Access Private (Admin only)
export const createTestimonial = AsyncHandler(async (req, res, next) => {
    const {
        client_name,
        client_role = null,
        company = null,
        client_image = null,
        rating = null,
        testimonial,
        is_featured = false,
        is_published = false,
        sort_order = 0,
    } = req.body;

    let uploadedImage = null;
    try {
        if (req.file) {
            uploadedImage = await uploadAndProcessImage(STORAGE_BUCKETS.TESTIMONIALS, req.file);
        }

        const imageValue = uploadedImage
            ? (typeof uploadedImage === "string" ? uploadedImage : uploadedImage?.image_url || uploadedImage?.fileName)
            : (client_image ? client_image.trim() : null);

        const { data: newTestimonial, error: insertError } = await supabase
            .from("testimonials")
            .insert({
                client_name: client_name.trim(),
                client_role: client_role ? client_role.trim() : null,
                company: company ? company.trim() : null,
                client_image: imageValue || null,
                rating: rating !== undefined && rating !== null ? Number(rating) : null,
                testimonial: testimonial.trim(),
                is_featured: Boolean(is_featured),
                is_published: Boolean(is_published),
                sort_order: Number(sort_order) || 0,
            })
            .select()
            .single();

        if (insertError || !newTestimonial) {
            throw new ApiError("Failed to create testimonial", 500);
        }

        // Invalidate public testimonials cache
        await deleteCache(CACHE_KEYS.TESTIMONIALS);
        await deleteByPattern("testimonials:*");

        return sendSuccess(res, {
            statusCode: 201,
            message: "Testimonial created successfully",
            results: newTestimonial,
        });
    } catch (error) {
        if (uploadedImage) {
            const fileName = typeof uploadedImage === "string"
                ? uploadedImage
                : (uploadedImage?.fileName || uploadedImage?.path);
            await rollbackUploadedImage(STORAGE_BUCKETS.TESTIMONIALS, fileName);
        }
        return next(error);
    }
});
