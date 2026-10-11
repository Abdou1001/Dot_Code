import { supabase } from "../../config/supabase.js";
import ApiError from "../../utils/ApiError.js";
import bcrypt from "bcrypt";
import AsyncHandler from "express-async-handler";
import { generateOTPData } from "../../utils/otp.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { emailVerificationTemplate } from "../../utils/emailTemplate.js";

// @Desc Register New User
// @Route POST /api/auth/register
// @Access Public
export const register = AsyncHandler(async (req, res, next) => {
    const {
        full_name,
        email,
        password,
    } = req.body;

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check existing user
    const { data: existingUser, error: findError } = await supabase
        .from("users")
        .select("id, email, email_verified_at")
        .eq("email", normalizedEmail)
        .maybeSingle();

    if (findError) {
        return next(
            new ApiError(
                "An error occurred while checking the email address",
                500,
            ),
        );
    }

    // Existing verified account
    if (existingUser?.email_verified_at) {
        return next(
            new ApiError(
                "This email is already registered. You can log in.",
                409,
            ),
        );
    }

    // Generate OTP
    const { otp, hashedOTP, expires } = generateOTPData();

    // Existing but not verified
    if (existingUser) {
        const { error: updateError } = await supabase
            .from("users")
            .update({
                email_otp_hash: hashedOTP,
                email_otp_expires_at: expires,
            })
            .eq("id", existingUser.id);

        if (updateError) {
            return next(
                new ApiError(
                    "An error occurred while generating the verification code",
                    500,
                ),
            );
        }

        await sendEmail({
            to: normalizedEmail,
            subject: "Verify Your Email - Dot Code",
            html: emailVerificationTemplate(otp),
        });

        return res.status(200).json({
            status: "success",
            message:
                "The account is not verified. A new verification code has been sent to your email.",
        });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const { error: createError } = await supabase
        .from("users")
        .insert({
            full_name,
            email: normalizedEmail,
            password_hash: passwordHash,
            role: "user",
            is_active: true,
            email_otp_hash: hashedOTP,
            email_otp_expires_at: expires,
        });

    if (createError) {
        console.error(createError);

        return next(
            new ApiError(
                "An error occurred while creating the account. Please try again.",
                400,
            ),
        );
    }

    // Send OTP
    await sendEmail({
        to: normalizedEmail,
        subject: "Verify Your Email - Dot Code",
        html: emailVerificationTemplate(otp),
    });

    return res.status(201).json({
        status: "success",
        message:
            "Account created successfully. A verification code has been sent to your email.",
    });
});
