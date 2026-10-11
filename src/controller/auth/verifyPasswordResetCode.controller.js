import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { hashOTP } from "../../utils/otp.js";
import { sendSuccess } from "../../utils/response.js";

// @Desc User sends reset password code to verify it
// @Route POST : /api/auth/verify-reset-code
// @Access Public
export const verifyPasswordResetCode = AsyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Hash reset code
    const hashedOTP = hashOTP(otp);

    // Check user + code + expiration
    const { data: user, error } = await supabase
        .from("users")
        .select("id, email, password_reset_otp_hash, password_reset_otp_expires_at")
        .eq("email", normalizedEmail)
        .maybeSingle();

    if (error || !user) {
        return next(
            new ApiError(
                "Account not found",
                404,
            ),
        );
    }

    // Check OTP
    if (user.password_reset_otp_hash !== hashedOTP) {
        return next(
            new ApiError(
                "The verification code is invalid or has expired. Please try again.",
                400,
            ),
        );
    }

    // Check expiration
    if (
        !user.password_reset_otp_expires_at ||
        Date.now() > Date.parse(user.password_reset_otp_expires_at)
    ) {
        return next(
            new ApiError(
                "The verification code has expired. Please request a new one.",
                400,
            ),
        );
    }

    // Mark password reset code as verified
    const { error: updateError } = await supabase
        .from("users")
        .update({
            password_reset_otp_hash: null,
            password_reset_otp_expires_at: null,
            password_reset_verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    if (updateError) {
        return next(
            new ApiError(
                "Something went wrong while verifying the code. Please try again.",
                500,
            ),
        );
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "Password reset code verified successfully.",
    });
});