import { z } from "zod";

// =========================
// Register Validation
// =========================
export const registerSchema = z.object({
    full_name: z
        .string("Full name is required")
        .trim()
        .min(2, "Full name must be at least 2 characters")
        .max(150, "Full name must not exceed 150 characters"),

    email: z
        .string("Email is required")
        .trim()
        .email("Please enter a valid email address")
        .max(255, "Email must not exceed 255 characters"),

    password: z
        .string("Password is required")
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must not exceed 128 characters"),
});
