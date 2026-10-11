import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { generateOTPData } from "../../utils/otp.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { emailVerificationTemplate } from "../../utils/emailTemplate.js";

// @Desc Resend Email Verification OTP
// @Route POST /api/auth/resend-otp
// @Access Public
export const resendOTP = AsyncHandler(async (req, res, next) => {
    const { email } = req.body;

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check user
    const { data: user, error } = await supabase
        .from("users")
        .select("id, email, email_verified_at")
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

    // Generate OTP
    const { otp, hashedOTP, expires } = generateOTPData();

    // Save OTP
    const { error: updateError } = await supabase
        .from("users")
        .update({
            email_otp_hash: hashedOTP,
            email_otp_expires_at: expires,
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
        // Send Email OTP
        await sendEmail({
            to: normalizedEmail,
            subject: "Verify Your Email - Dot Code",
            html: emailVerificationTemplate(otp),
        });
    } catch (error) {
        return next(
            new ApiError(
                "Failed to send the verification code. Please try again.",
                500,
            ),
        );
    }

    return res.status(200).json({
        status: "success",
        message: "A new verification code has been sent to your email.",
    });
});
