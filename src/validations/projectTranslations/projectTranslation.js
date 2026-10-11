import z from "zod";

// ===================================
// Project Translation Validation Schema
// ===================================
export const projectTranslationSchema = z.object({
    locale: z
        .enum(["ar", "en"], {
            errorMap: () => ({ message: "Locale must be either 'ar' or 'en'" }),
        })
        .optional(),

    title: z
        .string({ required_error: "Title is required" })
        .trim()
        .min(1, "Title cannot be empty")
        .max(200, "Title must not exceed 200 characters"),

    description: z
        .string()
        .trim()
        .nullable()
        .optional()
        .or(z.literal("")),

    role: z
        .string()
        .trim()
        .nullable()
        .optional()
        .or(z.literal("")),

    challenge: z
        .string()
        .trim()
        .nullable()
        .optional()
        .or(z.literal("")),

    solution: z
        .string()
        .trim()
        .nullable()
        .optional()
        .or(z.literal("")),

    result: z
        .string()
        .trim()
        .nullable()
        .optional()
        .or(z.literal("")),

    meta_title: z
        .string()
        .trim()
        .max(255, "Meta title must not exceed 255 characters")
        .nullable()
        .optional()
        .or(z.literal("")),

    meta_description: z
        .string()
        .trim()
        .max(500, "Meta description must not exceed 500 characters")
        .nullable()
        .optional()
        .or(z.literal("")),
});
