import ApiError from "../utils/ApiError.js";

// @Desc Handle invalid token
const handleJwtInvalidSignature = () =>
    new ApiError("Invalid token, please log in again.", 401);

// @Desc Handle expired token
const handleJwtExpired = () =>
    new ApiError("Session expired, please log in again.", 401);

// @Desc Handle zod validation errors
const handleZodError = (err) => ({
    status: "fail",
    errors: err.issues.map((issue) => ({
        field: issue.path[0],
        message: issue.message,
    })),
});

// @Desc Global error middleware
export const globalError = (err, req, res, next) => {
    let error = err;
    const statusCode = +error.statusCode || 500;

    if (error.name === "JsonWebTokenError")
        error = handleJwtInvalidSignature();

    if (error.name === "TokenExpiredError")
        error = handleJwtExpired();

    if (error.name === "ZodError")
        return res.status(400).json(handleZodError(error));

    if (process.env.MODE_DEV === "development") {
        return res.status(statusCode).json({
            status: error.status || "error",
            message: error.message || "Something went wrong on the server.",
            stack: error.stack,
        });
    }

    res.status(statusCode).json({
        status: error.status || "error",
        message: error.message || "Something went wrong on the server.",
    });
};