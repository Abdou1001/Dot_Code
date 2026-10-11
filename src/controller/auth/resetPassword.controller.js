import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import bcrypt from "bcrypt";
import { sendSuccess } from "../../utils/response.js";

// @Desc Reset user password
// @Route POST : /api/auth/reset-password
// @Access Public
export const resetPassword = AsyncHandler(async (req, res, next) => {
    const { email, newPassword } = req.body;

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check user
    const { data: user, error } = await supabase
        .from("users")
        .select("id, email, password_reset_verified_at")
        .eq("email", normalizedEmail)
        .maybeSingle();

    if (error || !user) {
        return next(
            new ApiError("Account not found", 404),
        );
    }

    // Check verification
    if (!user.password_reset_verified_at) {
        return next(
            new ApiError(
                "Reset code has not been verified. Please verify your code first.",
                401,
            ),
        );
    }

    // Check if verification session has expired (e.g. 15 minutes window)
    const verificationTime = Date.parse(user.password_reset_verified_at);
    const fifteenMinutes = 15 * 60 * 1000;
    if (Date.now() - verificationTime > fifteenMinutes) {
        return next(
            new ApiError(
                "Password reset session has expired. Please request a new reset code.",
                400,
            ),
        );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset fields
    const { error: updateError } = await supabase
        .from("users")
        .update({
            password_hash: passwordHash,
            password_reset_otp_hash: null,
            password_reset_otp_expires_at: null,
            password_reset_verified_at: null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    if (updateError) {
        return next(
            new ApiError(
                "An error occurred while resetting the password. Please try again.",
                500,
            ),
        );
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "Password changed successfully.",
    });
});