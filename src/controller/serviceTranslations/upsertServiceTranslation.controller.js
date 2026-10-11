import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Create or update service translation using upsert
// @Route PUT /api/services/:serviceId/translations/:locale
// @Access Private (Admin only)
export const upsertServiceTranslation = AsyncHandler(async (req, res, next) => {
    const { serviceId } = req.params;
    const targetLocale = (req.params.locale || req.body.locale || "").toLowerCase().trim();

    if (!serviceId || !UUID_REGEX.test(serviceId)) {
        return next(new ApiError("Invalid service ID format", 400));
    }

    if (!["ar", "en"].includes(targetLocale)) {
        return next(new ApiError("Locale must be either 'ar' or 'en'", 400));
    }

    const {
        title,
        description = null,
    } = req.body;

    // Check service existence
    const { data: service, error: serviceError } = await supabase
        .from("services")
        .select("id, slug")
        .eq("id", serviceId)
        .maybeSingle();

    if (serviceError) {
        return next(new ApiError("An error occurred while validating service existence", 500));
    }

    if (!service) {
        return next(new ApiError("Service not found", 404));
    }

    // Upsert service translation by (service_id, locale)
    const { data: translation, error: upsertError } = await supabase
        .from("service_translations")
        .upsert(
            {
                service_id: serviceId,
                locale: targetLocale,
                title,
                description: description || null,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "service_id,locale" },
        )
        .select()
        .single();

    if (upsertError || !translation) {
        return next(new ApiError("Failed to save service translation", 500));
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
        message: "Service translation saved successfully",
        results: translation,
    });
});
