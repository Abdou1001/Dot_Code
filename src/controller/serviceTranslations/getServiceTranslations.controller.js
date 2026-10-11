import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Get all translations for a service
// @Route GET /api/services/:serviceId/translations
// @Access Public (for active services) / Private (for all services)
export const getServiceTranslations = AsyncHandler(async (req, res, next) => {
    const { serviceId } = req.params;

    if (!serviceId || !UUID_REGEX.test(serviceId)) {
        return next(new ApiError("Invalid service ID format", 400));
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

    const { data: translations, error: transError } = await supabase
        .from("service_translations")
        .select("*")
        .eq("service_id", serviceId)
        .order("locale", { ascending: true });

    if (transError) {
        return next(new ApiError("Failed to fetch service translations", 500));
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "Service translations retrieved successfully",
        results: translations || [],
    });
});
