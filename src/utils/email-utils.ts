export const otpVerificationHtml = (
  user: { username: string; email: string },
  otp: string
) => {
  const html = `
  <div style="margin:0; padding:0; background-color:#f4f6fb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
      <tr>
        <td align="center">
          <table width="100%" max-width="500px" cellpadding="0" cellspacing="0" 
            style="background:#ffffff; border-radius:12px; padding:30px; box-shadow:0 5px 15px rgba(0,0,0,0.08);">
            
            <tr>
              <td align="center">
                <h1 style="margin:0; color:#1f2937;">🔐 Email Verification</h1>
                <p style="color:#6b7280; font-size:15px; margin:10px 0 20px;">
                  Hello <b>${user.username}</b>, verify your email using the OTP below.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center">
                <div style="
                  font-size:32px;
                  font-weight:700;
                  letter-spacing:6px;
                  color:#2563eb;
                  background:#eef2ff;
                  padding:15px 25px;
                  border-radius:10px;
                  display:inline-block;
                  margin:20px 0;
                ">
                  ${otp}
                </div>
              </td>
            </tr>

            <tr>
              <td align="center">
                <p style="color:#6b7280; font-size:14px; margin:0;">
                  This OTP is valid for <b>5 minutes</b>.
                </p>
                <p style="color:#9ca3af; font-size:13px; margin:10px 0 0;">
                  If you did not request this, please ignore this email.
                </p>
              </td>
            </tr>

            <tr>
              <td>
                <hr style="border:none; border-top:1px solid #e5e7eb; margin:25px 0;" />
              </td>
            </tr>

            <tr>
              <td align="center">
                <p style="font-size:12px; color:#9ca3af; margin:0;">
                  © 2026 Auth System · All rights reserved
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
  `;

  return html;
};
