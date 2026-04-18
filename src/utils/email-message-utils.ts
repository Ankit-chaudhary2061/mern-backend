export const contactMessageHtml = (
  user: { name: string; email: string },
  message: string,
  subject?: string
) => {
  const html = `
  <div style="margin:0; padding:0; background-color:#f4f6fb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" 
            style="max-width:520px; background:#ffffff; border-radius:12px; padding:30px; box-shadow:0 5px 15px rgba(0,0,0,0.08);">

            <!-- Header -->
            <tr>
              <td align="center">
                <h1 style="margin:0; color:#111827;">📩 New Contact Message</h1>
                <p style="color:#6b7280; font-size:14px; margin:8px 0 20px;">
                  You've received a new message from your website
                </p>
              </td>
            </tr>

            <!-- Customer Info (like order summary) -->
            <tr>
              <td>
                <div style="background:#f9fafb; padding:15px 20px; border-radius:10px; margin-bottom:20px;">
                  <p style="margin:0; font-size:14px; color:#374151;">
                    <strong>Name:</strong> ${user.name}
                  </p>
                  <p style="margin:5px 0 0; font-size:14px; color:#374151;">
                    <strong>Email:</strong> ${user.email}
                  </p>
                  ${
                    subject
                      ? `<p style="margin:5px 0 0; font-size:14px; color:#374151;">
                          <strong>Subject:</strong> ${subject}
                        </p>`
                      : ""
                  }
                </div>
              </td>
            </tr>

            <!-- Message Box -->
            <tr>
              <td>
                <div style="
                  background:#eef2ff;
                  padding:18px;
                  border-radius:10px;
                  color:#1f2937;
                  font-size:14px;
                  line-height:1.6;
                ">
                  ${message}
                </div>
              </td>
            </tr>

            <!-- Action Button -->
            <tr>
              <td align="center" style="padding-top:25px;">
                <a href="mailto:${user.email}" style="
                  display:inline-block;
                  background:#2563eb;
                  color:#ffffff;
                  text-decoration:none;
                  padding:12px 22px;
                  border-radius:8px;
                  font-size:14px;
                  font-weight:600;
                ">
                  Reply to ${user.name}
                </a>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td>
                <hr style="border:none; border-top:1px solid #e5e7eb; margin:25px 0;" />
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center">
                <p style="font-size:12px; color:#9ca3af; margin:0;">
                  © 2026 Your Company · Contact System
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