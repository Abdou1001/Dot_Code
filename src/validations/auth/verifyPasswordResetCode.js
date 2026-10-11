import z from "zod";

// ======================================
// Verify Password Reset Code Validation
// ======================================
export const verifyPasswordResetCodeSchema = z.object({
    email: z
        .string("Email is required")
        .trim()
        .email("Please enter a valid email address")
        .max(255, "Email must not exceed 255 characters"),

    otp: z
        .string("Verification code is required")
        .trim()
        .length(6, "Verification code must be 6 digits")
        .regex(/^\d+$/, "Verification code must contain only numbers"),
});
