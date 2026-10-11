import AsyncHandler from "express-async-handler";
import { sendSuccess } from "../../utils/response.js";

// @Desc Get current logged-in admin
// @Route GET : /api/auth/me
// @Access Private
export const getMe = AsyncHandler(async (req, res) => {
    return sendSuccess(res, {
        message: "User data was retrieved successfully",
        results: { user: req.user },
    });
});
