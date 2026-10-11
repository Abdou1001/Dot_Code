import nodemailer from "nodemailer";
import AsyncHandler from "express-async-handler";

import ApiError from "./ApiError.js";


// @Desc Send email to user
export const sendEmail = AsyncHandler(async ({ to, subject, html, }) => {
    // Create transporter service
    // Gmail service responsible for sending emails
    const transporter =
        nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            // false => use port 587
            // true  => use port 465
            secure: true,

            // Gmail account info
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

    // Email options
    const mailOptions = {
        // Sender email
        from:
            `Dot Code — Software Agency <${process.env.EMAIL_USER}>`,
        // Receiver email
        to,
        // Email subject
        subject,
        // HTML template
        html,
    };


    // Send email
    const info =
        await transporter.sendMail(mailOptions);
    // If email failed
    if (!info.accepted.length)
        throw new ApiError(
            "failed to send email",
            500
        );

    // Log success response
    console.log(info);

    return info;

});