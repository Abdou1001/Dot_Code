import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Get translation of a service for a specific locale (ar or en)
// @Route GET /api/services/:serviceId/translations/:locale
// @Access Public (for active services) / Private (for all services)
export const getServiceTranslationByLocale = AsyncHandler(async (req, res, next) => {
    const { serviceId, locale } = req.params;

    if (!serviceId || !UUID_REGEX.test(serviceId)) {
        return next(new ApiError("Invalid service ID format", 400));
    }

    const normalizedLocale = (locale || "").toLowerCase().trim();

    if (!["ar", "en"].includes(normalizedLocale)) {
        return next(new ApiError("Locale must be either 'ar' or 'en'", 400));
    }

    // Check service existence and status
    const { data: service, error: serviceError } = await supabase
        .from("services")
        .select("id, is_active")
        .eq("id", serviceId)
        .maybeSingle();

    if (serviceError) {
        return next(new ApiError("An error occurred while fetching service", 500));
    }

    if (!service) {
        return next(new ApiError("Service not found", 404));
    }

    // Public users can only read translations of active services
    if (!service.is_active && !req.isAdmin) {
        return next(new ApiError("Service not found", 404));
    }

    const { data: translation, error: transError } = await supabase
        .from("service_translations")
        .select("*")
        .eq("service_id", serviceId)
        .eq("locale", normalizedLocale)
        .maybeSingle();

    if (transError) {
        return next(new ApiError("Failed to fetch service translation", 500));
    }

    if (!translation) {
        return next(new ApiError(`Translation for locale '${normalizedLocale}' not found`, 404));
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "Service translation retrieved successfully",
        results: translation,
    });
});
