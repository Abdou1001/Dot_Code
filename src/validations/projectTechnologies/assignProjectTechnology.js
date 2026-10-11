import z from "zod";
import { UUID_REGEX } from "../../utils/uuid.js";

// ===========================================
// Assign Project Technology Validation Schema
// ===========================================
export const assignProjectTechnologySchema = z
    .object({
        technology_id: z
            .string()
            .regex(UUID_REGEX, "Invalid technology ID format")
            .optional(),
        technologyId: z
            .string()
            .regex(UUID_REGEX, "Invalid technology ID format")
            .optional(),
    })
    .refine((data) => data.technology_id || data.technologyId, {
        message: "Technology ID is required",
        path: ["technology_id"],
    });
