import z from "zod";

// ===================================
// Create Visitor Event Validation
// ===================================
export const createVisitorEventSchema = z.object({
    session_id: z
        .string({ required_error: "Session ID is required" })
        .trim()
        .uuid("Invalid session ID format"),

    page_path: z
        .string({ required_error: "Page path is required" })
        .trim()
        .min(1, "Page path cannot be empty")
        .max(2000, "Page path must not exceed 2000 characters"),

    referrer: z
        .string()
        .trim()
        .max(2000, "Referrer must not exceed 2000 characters")
        .nullable()
        .optional()
        .or(z.literal("")),

    device_type: z
        .string()
        .trim()
        .max(30, "Device type must not exceed 30 characters")
        .nullable()
        .optional()
        .or(z.literal("")),

    country: z
        .string()
        .trim()
        .max(100, "Country must not exceed 100 characters")
        .nullable()
        .optional()
        .or(z.literal("")),
});
