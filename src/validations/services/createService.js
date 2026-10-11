import z from "zod";

// ==========================
// Create Service Validation
// ==========================
export const createServiceSchema = z.object({
    slug: z
        .string({ required_error: "Slug is required" })
        .trim()
        .min(1, "Slug cannot be empty")
        .max(150, "Slug must not exceed 150 characters")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens (e.g. web-development)"),

    icon: z
        .string()
        .trim()
        .nullable()
        .optional()
        .or(z.literal("")),

    sort_order: z.coerce.number().int().default(0).optional(),

    is_active: z.boolean().default(true).optional(),
});
