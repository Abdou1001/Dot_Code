import z from "zod";
import { UUID_REGEX } from "../../utils/uuid.js";

// =========================================
// Assign Project Category Validation Schema
// =========================================
export const assignProjectCategorySchema = z
    .object({
        category_id: z
            .string()
            .regex(UUID_REGEX, "Invalid category ID format")
            .optional(),
        categoryId: z
            .string()
            .regex(UUID_REGEX, "Invalid category ID format")
            .optional(),
    })
    .refine((data) => data.category_id || data.categoryId, {
        message: "Category ID is required",
        path: ["category_id"],
    });
