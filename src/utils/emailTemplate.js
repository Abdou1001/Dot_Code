// @Desc Email verification OTP template
export const emailVerificationTemplate = (code) => {
    return `
    <div style="
        background:#f3f4f6;
        padding:40px 20px;
        font-family:Arial,sans-serif;
    ">

        <div style="
            max-width:600px;
            margin:auto;
            background:white;
            border-radius:16px;
            overflow:hidden;
            box-shadow:0 5px 20px rgba(0,0,0,.08);
        ">

            <!-- Header -->

            <div style="
                background:#2563eb;
                padding:30px;
                text-align:center;
            ">

                <h1 style="
                    color:white;
                    margin:0;
                    font-size:28px;
                ">
                    Dot Code
                </h1>

            </div>


            <!-- Body -->

            <div style="
                padding:40px 30px;
                text-align:left;
            ">

                <h2 style="
                    color:#111827;
                    margin-bottom:20px;
                ">
                    Verify Your Email Address
                </h2>

                <p style="
                    color:#4b5563;
                    font-size:16px;
                    line-height:1.8;
                ">
                    Thank you for creating an account with Dot Code.
                </p>

                <p style="
                    color:#4b5563;
                    font-size:16px;
                    line-height:1.8;
                ">
                    Please use the verification code below to verify your email address:
                </p>


                <!-- Code -->

                <div style="
                    text-align:center;
                    margin:40px 0;
                ">

                    <span style="
                        display:inline-block;
                        background:#eff6ff;
                        color:#2563eb;
                        padding:18px 40px;
                        font-size:40px;
                        font-weight:bold;
                        letter-spacing:10px;
                        border-radius:12px;
                    ">
                        ${code}
                    </span>

                </div>


                <!-- Warning -->

                <div style="
                    background:#fef2f2;
                    color:#dc2626;
                    padding:15px;
                    border-radius:10px;
                    font-size:14px;
                    margin-top:20px;
                ">
                    This verification code is valid for 10 minutes only.
                </div>

            </div>


            <!-- Footer -->

            <div style="
                border-top:1px solid #e5e7eb;
                padding:20px;
                text-align:center;
                font-size:13px;
                color:#6b7280;
            ">

                If you did not create this account, you can safely ignore this email.

            </div>

        </div>

    </div>
    `;
};





// @Desc Reset password OTP template
export const resetPasswordTemplate = (code) => {
    return `
    <div style="
        background:#f3f4f6;
        padding:40px 20px;
        font-family:Arial,sans-serif;
    ">

        <div style="
            max-width:600px;
            margin:auto;
            background:white;
            border-radius:16px;
            overflow:hidden;
            box-shadow:0 5px 20px rgba(0,0,0,.08);
        ">

            <!-- Header -->

            <div style="
                background:#2563eb;
                padding:30px;
                text-align:center;
            ">

                <h1 style="
                    color:white;
                    margin:0;
                    font-size:28px;
                ">
                    Dot Code
                </h1>

            </div>


            <!-- Body -->

            <div style="
                padding:40px 30px;
                text-align:left;
            ">

                <h2 style="
                    color:#111827;
                    margin-bottom:20px;
                ">
                    Reset Your Password
                </h2>

                <p style="
                    color:#4b5563;
                    font-size:16px;
                    line-height:1.8;
                ">
                    We received a request to reset the password for your account.
                </p>

                <p style="
                    color:#4b5563;
                    font-size:16px;
                    line-height:1.8;
                ">
                    Use the verification code below to continue with the password reset:
                </p>


                <!-- Code -->

                <div style="
                    text-align:center;
                    margin:40px 0;
                ">

                    <span style="
                        display:inline-block;
                        background:#eff6ff;
                        color:#2563eb;
                        padding:18px 40px;
                        font-size:40px;
                        font-weight:bold;
                        letter-spacing:10px;
                        border-radius:12px;
                    ">
                        ${code}
                    </span>

                </div>


                <!-- Warning -->

                <div style="
                    background:#fef2f2;
                    color:#dc2626;
                    padding:15px;
                    border-radius:10px;
                    font-size:14px;
                    margin-top:20px;
                ">
                    This verification code is valid for 10 minutes only.
                </div>

            </div>


            <!-- Footer -->

            <div style="
                border-top:1px solid #e5e7eb;
                padding:20px;
                text-align:center;
                font-size:13px;
                color:#6b7280;
            ">

                If you did not request a password reset, you can safely ignore this email.

            </div>

        </div>

    </div>
    `;
};