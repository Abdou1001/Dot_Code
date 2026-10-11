import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Update message status (new, read, replied, archived)
// @Route PATCH /api/messages/:id/status
// @Access Private (Admin only)
export const updateMessageStatus = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !UUID_REGEX.test(id)) {
        return next(new ApiError("Invalid message ID format", 400));
    }

    // Check if message exists
    const { data: existingMessage, error: findError } = await supabase
        .from("messages")
        .select("id, status")
        .eq("id", id)
        .maybeSingle();

    if (findError) {
        return next(new ApiError("An error occurred while fetching the message", 500));
    }

    if (!existingMessage) {
        return next(new ApiError("Message not found", 404));
    }

    const { data: updatedMessage, error: updateError } = await supabase
        .from("messages")
        .update({
            status,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (updateError || !updatedMessage) {
        return next(new ApiError("Failed to update message status", 500));
    }

    // Invalidate dashboard statistics cache if exists
    await deleteCache(CACHE_KEYS.DASHBOARD);

    return sendSuccess(res, {
        statusCode: 200,
        message: "Message status updated successfully",
        results: updatedMessage,
    });
});
