import z from "zod";

// ===========================
// Create Category Validation
// ===========================
export const createCategorySchema = z.object({
    name: z
        .string({required_error: "Name is required"})
        .trim()
        .min(1, "Name cannot be empty")
        .max(100, "Name must not exceed 100 characters"),

    name_ar: z
        .string({required_error: "Name is required"})
        .trim()
        .min(1, "Name cannot be empty")
        .max(100, "Name must not exceed 100 characters"),

    slug: z
        .string({required_error: "Slug is required"})
        .trim()
        .min(1, "Slug cannot be empty")
        .max(100, "Slug must not exceed 100 characters")
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug must be lowercase alphanumeric with hyphens (e.g. web-development)",
        ),

    sort_order: z.coerce.number().int().default(0).optional(),

    is_active: z.boolean().default(true).optional(),
});
