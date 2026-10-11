import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { deleteCache } from "../../services/cache.service.js";
import { CACHE_KEYS } from "../../config/cache.js";
import { UUID_REGEX } from "../../utils/uuid.js";

// @Desc Delete message
// @Route DELETE /api/messages/:id
// @Access Private (Admin only)
export const deleteMessage = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id || !UUID_REGEX.test(id)) {
        return next(new ApiError("Invalid message ID format", 400));
    }

    // Check if message exists
    const { data: existingMessage, error: findError } = await supabase
        .from("messages")
        .select("id")
        .eq("id", id)
        .maybeSingle();

    if (findError) {
        return next(new ApiError("An error occurred while checking message existence", 500));
    }

    if (!existingMessage) {
        return next(new ApiError("Message not found", 404));
    }

    // Delete message
    const { error: deleteError } = await supabase
        .from("messages")
        .delete()
        .eq("id", id);

    if (deleteError) {
        return next(new ApiError("Failed to delete message", 500));
    }

    // Invalidate dashboard statistics cache if exists
    await deleteCache(CACHE_KEYS.DASHBOARD);

    return sendSuccess(res, {
        statusCode: 200,
        message: "Message deleted successfully",
    });
});
