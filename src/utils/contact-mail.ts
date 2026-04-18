import nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

const sendMail = async (mailInfo: MailOptions) => {
 const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

  await transporter.sendMail({
    from: `Contact Form <${process.env.EMAIL_USER}>`,
    to: mailInfo.to,
    subject: mailInfo.subject,
    text: mailInfo.text,
    html: mailInfo.html,
  });
};

export default sendMail;