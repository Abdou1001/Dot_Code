import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Delete service
// @Route DELETE /api/services/:id
// @Access Private (Admin only)
export const deleteService = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id || !UUID_REGEX.test(id)) {
        return next(new ApiError("Invalid service ID format", 400));
    }

    // Check if service exists
    const { data: existingService, error: findError } = await supabase
        .from("services")
        .select("id, slug")
        .eq("id", id)
        .maybeSingle();

    if (findError) {
        return next(new ApiError("An error occurred while checking service existence", 500));
    }

    if (!existingService) {
        return next(new ApiError("Service not found", 404));
    }

    // Delete related service_translations if any
    await supabase.from("service_translations").delete().eq("service_id", id);

    // Delete service
    const { error: deleteError } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

    if (deleteError) {
        return next(new ApiError("Failed to delete service", 500));
    }

    // Invalidate cached single service and list patterns
    await deleteCache(CACHE_KEYS.SERVICE(existingService.id));
    if (existingService.slug) {
        await deleteCache(CACHE_KEYS.SERVICE(existingService.slug));
    }
    await deleteCache(CACHE_KEYS.SERVICES);
    await deleteByPattern("services:*");

    return sendSuccess(res, {
        statusCode: 200,
        message: "Service deleted successfully",
    });
});
