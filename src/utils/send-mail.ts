import nodemailer from "nodemailer";

interface IMailOption {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
  }>;
}


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendMail = async (mailOption: IMailOption) => {
  try {
    const mailOptions: any = {
      from: `"Auth System" <${process.env.SMTP_USER}>`,
      to: mailOption.to,
      subject: mailOption.subject,
      html: mailOption.html,
    };

    if (mailOption.cc) {
      mailOptions.cc = mailOption.cc;
    }

    if (mailOption.bcc) {
      mailOptions.bcc = mailOption.bcc;
    }

    if (mailOption.attachments) {
      mailOptions.attachments = mailOption.attachments;
    }

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent:", info.messageId);

  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error("Email not sent");
  }
};

