import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { hashOTP } from "../../utils/otp.js";
import { createSendToken } from "./createToken.controller.js";

// @Desc Verify Email OTP
// @Route POST /api/auth/verify-email-otp
// @Access Public
export const verifyEmailOTP = AsyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Hash OTP
    const hashedOTP = hashOTP(otp);

    // Get user
    const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", normalizedEmail)
        .maybeSingle();

    if (error || !user)
        return next(
            new ApiError(
                "Account not found",
                404,
            ),
        );

    // Already verified
    if (user.email_verified_at)
        return next(
            new ApiError(
                "Email is already verified. You can log in.",
                400,
            ),
        );

    // Check OTP
    if (user.email_otp_hash !== hashedOTP)
        return next(
            new ApiError(
                "Invalid verification code",
                400,
            ),
        );

    // Check expiration
    if (
        !user.email_otp_expires_at ||
        Date.now() > Date.parse(user.email_otp_expires_at)
    )
        return next(
            new ApiError(
                "Verification code has expired",
                400,
            ),
        );

    // Verify email
    const { data: verifiedUser, error: updateError } = await supabase
        .from("users")
        .update({
            email_verified_at: new Date().toISOString(),
            email_otp_hash: null,
            email_otp_expires_at: null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select("id, full_name, email, role, is_active, email_verified_at")
        .single();

    if (updateError || !verifiedUser)
        return next(
            new ApiError(
                "An error occurred while verifying your email",
                500,
            ),
        );

    // Login directly after verification
    return createSendToken(verifiedUser, 200, res);
});
