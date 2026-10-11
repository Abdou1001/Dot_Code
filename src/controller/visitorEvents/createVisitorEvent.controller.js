import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";

// Helper to determine device type from User-Agent if not explicitly provided
const resolveDeviceType = (deviceType, userAgent = "") => {
    if (deviceType && deviceType.trim()) {
        return deviceType.trim().toLowerCase().slice(0, 30);
    }

    if (!userAgent) return "unknown";

    const ua = userAgent.toLowerCase();
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "tablet";
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
        return "mobile";
    }
    return "desktop";
};

// @Desc Record a visitor event from the public website
// @Route POST /api/visitor-events
// @Access Public
export const createVisitorEvent = AsyncHandler(async (req, res, next) => {
    const {
        session_id,
        page_path,
        referrer = null,
        device_type = null,
        country = null,
    } = req.body;

    const userAgent = req.headers["user-agent"] || "";
    const resolvedDeviceType = resolveDeviceType(device_type, userAgent);

    // Fall back to Cloudflare/Reverse proxy header for country if not provided in payload
    const resolvedCountry = (country && country.trim())
        ? country.trim().slice(0, 100)
        : (req.headers["cf-ipcountry"] || req.headers["x-country"] || null);

    const { data: newEvent, error: insertError } = await supabase
        .from("visitor_events")
        .insert({
            session_id,
            page_path: page_path.trim(),
            referrer: referrer && referrer.trim() ? referrer.trim() : null,
            device_type: resolvedDeviceType,
            country: resolvedCountry ? String(resolvedCountry).trim().slice(0, 100) : null,
        })
        .select("id, session_id, page_path, created_at")
        .single();

    if (insertError || !newEvent) {
        return next(new ApiError("Failed to record visitor event", 500));
    }

    return sendSuccess(res, {
        statusCode: 201,
        message: "Visitor event recorded successfully",
        results: newEvent,
    });
});
