import crypto from "crypto";

/* =========================
   Generate 6 Digits OTP
========================= */

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/* =========================
   Hash OTP
========================= */

export const hashOTP = (otp) => {
    return crypto.createHash("sha256").update(otp).digest("hex");
};

/* =========================
   OTP Expiration
========================= */

export const otpExpires = (minutes = 10) => {
    return new Date(Date.now() + minutes * 60 * 1000);
};

/* =========================
   Generate OTP Data
========================= */

export const generateOTPData = (minutes = 10) => {
    const otp = generateOTP();

    return {
        otp,
        hashedOTP: hashOTP(otp),
        expires: otpExpires(minutes),
    };
};
