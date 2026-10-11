import AsyncHandler from "express-async-handler";
import { env } from "../../config/env.js";
import { sendSuccess } from "../../utils/response.js";

// @Desc Logout admin and clear token cookie
// @Route POST : /api/auth/logout
// @Access Public
export const logout = AsyncHandler(async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
    });

    return sendSuccess(res, {
        message: "You have successfully logged out",
    });
});
