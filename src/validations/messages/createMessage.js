import z from "zod";

// ==============================
// Create Message Validation
// ==============================
export const createMessageSchema = z.object({
    name: z
        .string({ required_error: "Name is required" })
        .trim()
        .min(1, "Name cannot be empty")
        .max(150, "Name must not exceed 150 characters"),

    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .email("Invalid email format")
        .max(255, "Email must not exceed 255 characters"),

    phone: z
        .string()
        .trim()
        .max(50, "Phone must not exceed 50 characters")
        .nullable()
        .optional()
        .or(z.literal("")),

    subject: z
        .string()
        .trim()
        .max(255, "Subject must not exceed 255 characters")
        .nullable()
        .optional()
        .or(z.literal("")),

    message: z
        .string({ required_error: "Message is required" })
        .trim()
        .min(1, "Message cannot be empty"),
});
