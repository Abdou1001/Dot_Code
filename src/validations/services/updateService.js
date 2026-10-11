import z from "zod";

// ==========================
// Update Service Validation
// ==========================
export const updateServiceSchema = z.object({
    slug: z
        .string()
        .trim()
        .min(1, "Slug cannot be empty")
        .max(150, "Slug must not exceed 150 characters")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens (e.g. web-development)")
        .optional(),

    icon: z
        .string()
        .trim()
        .nullable()
        .optional()
        .or(z.literal("")),

    sort_order: z.coerce.number().int().optional(),

    is_active: z.boolean().optional(),
});
