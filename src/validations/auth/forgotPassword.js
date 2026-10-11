import z from "zod";
/* =========================
   Forgot Password Validation
========================= */

export const forgotPasswordSchema = z.object({
    email: z
        .string("Email is required")
        .trim()
        .email("Please enter a valid email address"),
});