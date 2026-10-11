import crypto from "crypto";
import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";

// @Desc Submit a contact message from the public website
// @Route POST /api/messages
// @Access Public
export const createMessage = AsyncHandler(async (req, res, next) => {
    const {
        name,
        email,
        phone = null,
        subject = null,
        message,
    } = req.body;

    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || null;
    const ip_hash = ip ? crypto.createHash("sha256").update(String(ip)).digest("hex") : null;
    const user_agent = req.headers["user-agent"] || null;

    const { data: newMessage, error: insertError } = await supabase
        .from("messages")
        .insert({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : null,
            subject: subject ? subject.trim() : null,
            message: message.trim(),
            status: "new",
            ip_hash,
            user_agent,
        })
        .select("id, name, email, subject, status, created_at")
        .single();

    if (insertError || !newMessage) {
        return next(new ApiError("Failed to submit message", 500));
    }

    // Invalidate dashboard statistics cache if exists
    await deleteCache(CACHE_KEYS.DASHBOARD);

    return sendSuccess(res, {
        statusCode: 201,
        message: "Message submitted successfully",
        results: newMessage,
    });
});
