import z from "zod";

// =========================
// Create Project Validation
// =========================
export const createProjectSchema = z.object({
    slug: z
        .string({ required_error: "Slug is required" })
        .trim()
        .min(1, "Slug cannot be empty")
        .max(200, "Slug must not exceed 200 characters")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens (e.g. my-project)"),

    status: z
        .enum(["draft", "published", "hidden"], {
            errorMap: () => ({ message: "Status must be 'draft', 'published', or 'hidden'" }),
        })
        .default("draft")
        .optional(),

    featured: z.boolean().default(false).optional(),

    sort_order: z.coerce.number().int().default(0).optional(),

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
