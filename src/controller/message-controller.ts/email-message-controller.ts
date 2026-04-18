import { Request, Response } from "express";
import User from "../../database/models/user-model";
import nodemailer from "nodemailer";
import { contactMessageHtml } from "../../utils/email-message-utils";
import sendMail from "../../utils/contact-mail";

// adjust path

interface ContactMessage {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

const sendMessage = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      subject = "New Contact Form Message",
      message,
    }: ContactMessage = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required fields.",
      });
    }

    const html = contactMessageHtml(
      { name, email },
      message,
      subject
    );

    
    await sendMail({
      to: process.env.ADMIN_EMAIL!, 
      subject,
      text: message,
      html,
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });

  } catch (error) {
    console.error("Contact Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

export default sendMessage;