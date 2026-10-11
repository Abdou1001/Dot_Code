import z from "zod";

// =============================
// Update Technology Validation
// =============================
export const updateTechnologySchema = z.object({
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
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens (e.g. react-js)")
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
