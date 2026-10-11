import z from "zod";

/* =========================
   Reset Password Validation
========================= */
export const resetPasswordSchema = z
    .object({
        email: z
            .string("Email is required")
            .trim()
            .email("Invalid email address"),

        newPassword: z
            .string("Password is required")
            .min(6, "Password must be at least 6 characters"),

        confirmPassword: z.string("Password confirmation is required"),
    })

    // Password Confirm
    .refine((data) => data.newPassword === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    });