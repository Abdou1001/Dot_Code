import z from "zod";

// =====================================
// Update Project Image Validation Schema
// =====================================
export const updateProjectImageSchema = z.object({
    alt: z
        .string()
        .trim()
        .max(255, "Alt text must not exceed 255 characters")
        .nullable()
        .optional()
        .or(z.literal("")),

    sort_order: z.coerce
        .number({ invalid_type_error: "Sort order must be a number" })
        .int("Sort order must be an integer")
        .optional(),

    is_featured: z
        .preprocess((val) => {
            if (typeof val === "string") {
                const lower = val.trim().toLowerCase();
                if (lower === "true" || lower === "1") return true;
                if (lower === "false" || lower === "0") return false;
            }
            return val;
        }, z.boolean({ invalid_type_error: "is_featured must be a boolean" }))
        .optional(),
});
