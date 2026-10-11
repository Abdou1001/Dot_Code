import { supabase } from "../../config/supabase.js";
import ApiError from "../../utils/ApiError.js";
import bcrypt from "bcrypt";
import {createSendToken} from "./createToken.controller.js"
import AsyncHandler from "express-async-handler";

// @Desc Login the admin by email and password
// @Route POST : /api/auth/login
// @Access Public
export const login = AsyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
        .from("users")
        .select("id, email, password_hash, role, is_active")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

    if (
        error ||
        !user ||
        !(await bcrypt.compare(password, user.password_hash))
    )
        return next(
            new ApiError(
                "Invalid email or password",
                401
            )
        );

    if (!user.is_active)
        return next(
            new ApiError(
                "Your account has been deactivated by the administrator",
                401
            )
        );

    if (user.role !== "admin")
        return next(
            new ApiError(
                "You do not have permission to access this resource",
                403
            )
        );

    return createSendToken(user, 200, res);
});