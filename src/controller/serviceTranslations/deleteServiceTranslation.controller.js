import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Delete service translation for a specific locale
// @Route DELETE /api/services/:serviceId/translations/:locale
// @Access Private (Admin only)
export const deleteServiceTranslation = AsyncHandler(async (req, res, next) => {
    const { serviceId, locale } = req.params;

    // Validate service ID format
    if (!serviceId || !UUID_REGEX.test(serviceId)) {
        return next(new ApiError("Invalid service ID format", 400));
    }

    // Validate locale format
    const normalizedLocale = (locale || "").toLowerCase().trim();
    if (!["ar", "en"].includes(normalizedLocale)) {
        return next(new ApiError("Locale must be either 'ar' or 'en'", 400));
    }

    // Check service existence
    const { data: service, error: serviceError } = await supabase
        .from("services")
        .select("id, slug")
        .eq("id", serviceId)
        .maybeSingle();

    if (serviceError) {
        return next(new ApiError("An error occurred while checking service existence", 500));
    }

    if (!service) {
        return next(new ApiError("Service not found", 404));
    }

    // Check if the specific translation exists
    const { data: existingTranslation, error: findTransError } = await supabase
        .from("service_translations")
        .select("id")
        .eq("service_id", serviceId)
        .eq("locale", normalizedLocale)
        .maybeSingle();

    if (findTransError) {
        return next(new ApiError("An error occurred while checking translation existence", 500));
    }

    if (!existingTranslation) {
        return next(new ApiError(`Translation for locale '${normalizedLocale}' not found`, 404));
    }

    // Delete only the translation row
    const { error: deleteError } = await supabase
        .from("service_translations")
        .delete()
        .eq("service_id", serviceId)
        .eq("locale", normalizedLocale);

    if (deleteError) {
        return next(new ApiError("Failed to delete service translation", 500));
    }

    // Invalidate service cache
    await deleteCache(CACHE_KEYS.SERVICE(service.id));
    if (service.slug) {
        await deleteCache(CACHE_KEYS.SERVICE(service.slug));
    }
    await deleteCache(CACHE_KEYS.SERVICES);
    await deleteByPattern("services:*");

    return sendSuccess(res, {
        statusCode: 200,
        message: "Service translation deleted successfully",
    });
});
