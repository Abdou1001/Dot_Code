import express from "express";
import { protect, allowedTo } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { authRateLimit, otpRateLimit } from "../middlewares/rateLimit.middleware.js";

import { loginSchema } from "../validations/auth/login.js";
import { registerSchema } from "../validations/auth/register.js";
import { verifyEmailOTPSchema } from "../validations/auth/verifyEmailOTP.js";
import { forgotPasswordSchema } from "../validations/auth/forgotPassword.js";
import { verifyPasswordResetCodeSchema } from "../validations/auth/verifyPasswordResetCode.js";
import { resetPasswordSchema } from "../validations/auth/resetPassword.js";

import { login } from "../controller/auth/login.controller.js";
import { register } from "../controller/auth/register.controller.js";
import { verifyEmailOTP } from "../controller/auth/verifyEmailOTP.controller.js";
import { resendOTP } from "../controller/auth/resendOTP.controller.js";
import { getMe } from "../controller/auth/getMe.controller.js";
import { logout } from "../controller/auth/logout.controller.js";
import { forgotPassword } from "../controller/auth/forgotPassword.controller.js";
import { verifyPasswordResetCode } from "../controller/auth/verifyPasswordResetCode.controller.js";
import { resetPassword } from "../controller/auth/resetPassword.controller.js";

const router = express.Router();

// login
router.post("/login", authRateLimit, validate(loginSchema), login);

// Register
router.post("/register", authRateLimit, validate(registerSchema), register);

// Verify Email OTP
router.post(
    "/verify-email-otp",
    authRateLimit,
    validate(verifyEmailOTPSchema),
    verifyEmailOTP,
);

// Resend OTP 
router.post("/resend-otp", otpRateLimit, resendOTP);

// Forgot Password -- password
router.post(
    "/forgot-password",
    otpRateLimit,
    validate(forgotPasswordSchema),
    forgotPassword,
);

// Verify reset code -- password
router.post(
    "/verify-reset-code",
    authRateLimit,
    validate(verifyPasswordResetCodeSchema),
    verifyPasswordResetCode,
);

// Reset password -- password
router.post(
    "/reset-password",
    authRateLimit,
    validate(resetPasswordSchema),
    resetPassword,
);

// logout
router.post("/logout", logout);

// get user info
router.get("/me", protect, allowedTo("admin"), getMe);

export default router;
