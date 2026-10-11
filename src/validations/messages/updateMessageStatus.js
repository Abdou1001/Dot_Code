import z from "zod";

// ==============================
// Update Message Status Validation
// ==============================
export const updateMessageStatusSchema = z.object({
    status: z.enum(["new", "read", "replied", "archived"], {
        required_error: "Status is required",
        errorMap: () => ({ message: "Status must be 'new', 'read', 'replied', or 'archived'" }),
    }),
});
