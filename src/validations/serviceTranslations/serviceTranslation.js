import z from "zod";

// ===================================
// Service Translation Validation Schema
// ===================================
export const serviceTranslationSchema = z.object({
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
});

export const createServiceTranslationSchema = serviceTranslationSchema.extend({
    locale: z.enum(["ar", "en"], {
        errorMap: () => ({ message: "Locale must be either 'ar' or 'en'" }),
    }),
});
