import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Get one message by ID
// @Route GET /api/messages/:id
// @Access Private (Admin only)
export const getMessageById = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id || !UUID_REGEX.test(id)) {
        return next(new ApiError("Invalid message ID format", 400));
    }

    const { data: message, error } = await supabase
        .from("messages")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        return next(new ApiError("Failed to retrieve message", 500));
    }

    if (!message) {
        return next(new ApiError("Message not found", 404));
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "Message retrieved successfully",
        results: message,
    });
});
