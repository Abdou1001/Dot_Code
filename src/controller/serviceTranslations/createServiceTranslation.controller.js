import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache, deleteByPattern } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Create service translation
// @Route POST /api/services/:serviceId/translations
// @Access Private (Admin only)
export const createServiceTranslation = AsyncHandler(async (req, res, next) => {
    const { serviceId } = req.params;
    const targetLocale = (req.body.locale || "").toLowerCase().trim();

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

    // Check duplicate translation
    const { data: existingTranslation, error: checkError } = await supabase
        .from("service_translations")
        .select("id")
        .eq("service_id", serviceId)
        .eq("locale", targetLocale)
        .maybeSingle();

    if (checkError) {
        return next(new ApiError("An error occurred while checking translation existence", 500));
    }

    if (existingTranslation) {
        return next(new ApiError(`Translation for locale '${targetLocale}' already exists`, 409));
    }

    const { data: translation, error: insertError } = await supabase
        .from("service_translations")
        .insert({
            service_id: serviceId,
            locale: targetLocale,
            title,
            description: description || null,
        })
        .select()
        .single();

    if (insertError || !translation) {
        return next(new ApiError("Failed to create service translation", 500));
    }

    // Invalidate service cache
    await deleteCache(CACHE_KEYS.SERVICE(service.id));
    if (service.slug) {
        await deleteCache(CACHE_KEYS.SERVICE(service.slug));
    }
    await deleteCache(CACHE_KEYS.SERVICES);
    await deleteByPattern("services:*");

    return sendSuccess(res, {
        statusCode: 201,
        message: "Service translation created successfully",
        results: translation,
    });
});
