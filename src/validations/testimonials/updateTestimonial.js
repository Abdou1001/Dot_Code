import z from "zod";

// ===============================
// Update Testimonial Validation
// ===============================
export const updateTestimonialSchema = z.object({
    client_name: z
        .string()
        .trim()
        .min(1, "Client name cannot be empty")
        .max(150, "Client name must not exceed 150 characters")
        .optional(),

    client_role: z
        .string()
        .trim()
        .max(150, "Client role must not exceed 150 characters")
        .nullable()
        .optional()
        .or(z.literal("")),

    company: z
        .string()
        .trim()
        .max(150, "Company name must not exceed 150 characters")
        .nullable()
        .optional()
        .or(z.literal("")),

    client_image: z
        .string()
        .trim()
        .nullable()
        .optional()
        .or(z.literal("")),

    rating: z.coerce
        .number()
        .int("Rating must be an integer")
        .min(1, "Rating must be between 1 and 5")
        .max(5, "Rating must be between 1 and 5")
        .nullable()
        .optional(),

    testimonial: z
        .string()
        .trim()
        .min(1, "Testimonial text cannot be empty")
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

    is_published: z
        .preprocess((val) => {
            if (typeof val === "string") {
                const lower = val.trim().toLowerCase();
                if (lower === "true" || lower === "1") return true;
                if (lower === "false" || lower === "0") return false;
            }
            return val;
        }, z.boolean({ invalid_type_error: "is_published must be a boolean" }))
        .optional(),

    sort_order: z.coerce.number().int().optional(),
});
