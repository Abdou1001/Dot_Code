import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { generateOTPData } from "../../utils/otp.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { resetPasswordTemplate } from "../../utils/emailTemplate.js";
import { sendSuccess } from "../../utils/response.js";

// @Desc Send password reset code to user email
// @Route POST /api/auth/forgot-password
// @Access Public
export const forgotPassword = AsyncHandler(async (req, res, next) => {
    const { email } = req.body;

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const { data: user, error } = await supabase
        .from("users")
        .select("id, email, email_verified_at")
        .eq("email", normalizedEmail)
        .maybeSingle();

    if (error || !user)
        return next(
            new ApiError(
                "Email address not found",
                404,
            ),
        );

    // Check email verification
    if (!user.email_verified_at)
        return next(
            new ApiError(
                "Your email address is not verified. Please verify your email first.",
                400,
            ),
        );

    // Generate OTP
    const { otp, hashedOTP, expires } = generateOTPData();

    // Save password reset OTP
    const { error: updateError } = await supabase
        .from("users")
        .update({
            password_reset_otp_hash: hashedOTP,
            password_reset_otp_expires_at: expires,
            password_reset_verified_at: null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    if (updateError)
        return next(
            new ApiError(
                "An error occurred while generating the verification code",
                500,
            ),
        );

    try {
        // Send password reset OTP via email
        await sendEmail({
            to: normalizedEmail,
            subject: "Reset Your Password - Dot Code",
            html: resetPasswordTemplate(otp),
        });
    } catch (error) {
        // Rollback
        await supabase
            .from("users")
            .update({
                password_reset_otp_hash: null,
                password_reset_otp_expires_at: null,
                password_reset_verified_at: null,
            })
            .eq("id", user.id);

        return next(
            new ApiError(
                "Failed to send the verification code. Please try again.",
                500,
            ),
        );
    }

    return sendSuccess(res, {
        statusCode: 200,
        message: "A password reset code has been sent to your email.",
    });
});
