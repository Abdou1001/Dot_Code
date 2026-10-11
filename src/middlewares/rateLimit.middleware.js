import rateLimit from "express-rate-limit";

// @Desc Limit authentication requests
export const authRateLimit = rateLimit({
    // 10 minutes
    windowMs: 10 * 60 * 1000,

    // Maximum requests
    max: 5,

    message: {
        status: "fail",
        message:
            "Too many attempts. Please try again after 10 minutes.",
    },

    standardHeaders: true,
    legacyHeaders: false,
});

export const otpRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000,

    max: 3,

    message: {
        status: "fail",
        message:
            "The verification code has been requested too many times. Please wait 5 minutes before trying again.",
    },

    standardHeaders: true,
    legacyHeaders: false,
});

// For APIs
export const apiRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 200,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
        status: "fail",
        message: "Too many requests. Please try again later.",
    },
});

// For public contact messages
export const messageRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "fail",
        message: "Too many messages sent. Please try again after 15 minutes.",
    },
});

// For public visitor event tracking
export const visitorEventRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 events per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "fail",
        message: "Too many analytics events. Please slow down.",
    },
});
