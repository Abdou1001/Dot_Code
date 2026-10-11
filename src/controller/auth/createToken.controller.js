import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { sendSuccess } from "../../utils/response.js";


const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

// @Desc Make token for logged-in admin
const createToken = (payload) =>
    jwt.sign(payload, env.SECRET_KEY_JWT, {
        expiresIn: env.JWT_EXPIRES_IN,
    });

// @Desc Set an authenticated admin cookie and return safe user data
export const createSendToken = (user, statusCode, res) => {
    const token = createToken({
        user_id: user.id,
        role: user.role,
    });

    const { password_hash, ...safeUser } = user;

    res.cookie("token", token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
    });

    return sendSuccess(res, {
        statusCode,
        message: "You have been logged in successfully",
        results: { user: safeUser },
    });
};
