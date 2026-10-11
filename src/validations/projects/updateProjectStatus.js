import z from "zod";

// ==============================
// Update Project Status Validation
// ==============================
export const updateProjectStatusSchema = z.object({
    status: z.enum(["draft", "published", "hidden"], {
        required_error: "Status is required",
        errorMap: () => ({ message: "Status must be 'draft', 'published', or 'hidden'" }),
    }),
});
