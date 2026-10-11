import { supabase } from "../config/supabase.js";
import AsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import { env } from "../config/env.js";

export const extractToken = (req) => {
    if (req.cookies?.token) return req.cookies.token;
    if (req.headers?.authorization?.startsWith("Bearer ")) {
        return req.headers.authorization.split(" ")[1];
    }
    return null;
};

// @Desc Protect routes and check if user is logged in
// @Route Middleware
// @Access Private
export const protect = AsyncHandler(async (req, res, next) => {
    const token = extractToken(req);

    if (!token) return next(new ApiError("Please log in.", 401));

    let decoded;
    try {
        decoded = jwt.verify(token, env.SECRET_KEY_JWT);
    } catch {
        return next(new ApiError("Invalid or expired token. Please log in again.", 401));
    }

    if (!decoded?.user_id) {
        return next(new ApiError("Invalid token payload.", 401));
    }

    const { data: user, error } = await supabase
        .from("users")
        .select("id, full_name, email, role, is_active, created_at, updated_at")
        .eq("id", decoded.user_id)
        .maybeSingle();

    if (error || !user)
        return next(new ApiError("User not found.", 401));

    if (!user.is_active)
        return next(new ApiError("Your account has been suspended by the administrator.", 401));

    req.user = user;
    req.isAdmin = user.role === "admin";

    next();
});

// @Desc Optional authentication: populates req.user and req.isAdmin if token is provided, without blocking public access
// @Route Middleware
// @Access Public / Optional
export const optionalAuth = AsyncHandler(async (req, res, next) => {
    if (req.user) {
        req.isAdmin = Boolean(req.user.is_active && req.user.role === "admin");
        return next();
    }

    const token = extractToken(req);
    if (!token) {
        req.user = null;
        req.isAdmin = false;
        return next();
    }

    try {
        const decoded = jwt.verify(token, env.SECRET_KEY_JWT);
        if (!decoded?.user_id) {
            req.user = null;
            req.isAdmin = false;
            return next();
        }

        const { data: user } = await supabase
            .from("users")
            .select("id, full_name, email, role, is_active, created_at, updated_at")
            .eq("id", decoded.user_id)
            .maybeSingle();

        if (user && user.is_active) {
            req.user = user;
            req.isAdmin = user.role === "admin";
        } else {
            req.user = null;
            req.isAdmin = false;
        }
    } catch {
        req.user = null;
        req.isAdmin = false;
    }

    next();
});

// @Desc Authorize a logged-in user by role
// @Route Middleware
// @Access Private
export const allowedTo = (...roles) =>
    AsyncHandler(async (req, res, next) => {
        if (!roles.includes(req.user?.role))
            return next(new ApiError("You do not have permission to access this resource.", 403));

        next();
    });