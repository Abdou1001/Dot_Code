import z from "zod";

// =========================
// Update Project Validation
// =========================
export const updateProjectSchema = z.object({
    slug: z
        .string()
        .trim()
        .min(1, "Slug cannot be empty")
        .max(200, "Slug must not exceed 200 characters")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens (e.g. my-project)")
        .optional(),

    status: z
        .enum(["draft", "published", "hidden"], {
            errorMap: () => ({ message: "Status must be 'draft', 'published', or 'hidden'" }),
        })
        .optional(),

    featured: z.boolean().optional(),

    sort_order: z.coerce.number().int().optional(),

    live_url: z
        .string()
        .trim()
        .url("Invalid URL format for live_url")
        .nullable()
        .optional()
        .or(z.literal("")),

    github_url: z
        .string()
        .trim()
        .url("Invalid URL format for github_url")
        .nullable()
        .optional()
        .or(z.literal("")),
});
