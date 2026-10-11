import { z } from "zod";

// =========================
// Login Validation
// =========================
export const loginSchema = z.object({
    email: z
        .string("Email is required")
        .trim()
        .email("Please enter a valid email address"),

    password: z
        .string("Password is required")
        .min(6, "Password must be at least 6 characters"),
});


