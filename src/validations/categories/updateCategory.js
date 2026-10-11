import z from "zod";

// ===========================
// Update Category Validation
// ===========================
export const updateCategorySchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Name cannot be empty")
        .max(100, "Name must not exceed 100 characters")
        .optional(),

    slug: z
        .string()
        .trim()
        .min(1, "Slug cannot be empty")
        .max(100, "Slug must not exceed 100 characters")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens (e.g. web-development)")
        .optional(),

    sort_order: z.coerce.number().int().optional(),

    is_active: z.boolean().optional(),
});
