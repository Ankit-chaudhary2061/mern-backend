// resend-otp.ts

import crypto from "crypto";
import * as bcrypt from "bcrypt";
import { otpVerificationHtml } from "./email-utils";
import { sendMail } from "./send-mail";

// Generate OTP
export const createOtp = (length = 6): string => {
  let otp = "";

  for (let i = 0; i < length; i++) {
    otp += crypto.randomInt(0, 10);
  }

  return otp;
};

// Resend OTP
export const resend_Otp = async (user: any) => {
  try {
    console.log("=================================");
    console.log("RESEND OTP API CALLED");
    console.log("=================================");

    // Generate new OTP
    const newOtp = createOtp();

    // Hash OTP
    const newOtpHash = await bcrypt.hash(newOtp.toString(), 10);

    // Expiry time
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Save in database
    user.otp = newOtpHash;
    user.otpExpires = otpExpiry;

    // Debug logs
    console.log("NEW OTP:", newOtp);
    console.log("HASHED OTP:", newOtpHash);
    console.log("OTP EXPIRY:", otpExpiry);

    // Save user
    await user.save();

    // Send mail
   await sendMail({
  to: user.email,
  subject: `Your OTP Code - ${newOtp}`,
  html: otpVerificationHtml(user, newOtp),
});

    console.log("OTP EMAIL SENT SUCCESSFULLY");
    console.log("=================================");

    return {
      success: true,
      otp: newOtp, // remove in production
    };

  } catch (error: any) {
    console.error("RESEND OTP ERROR:", error);

    return {
      success: false,
      message: error.message,
    };
  }
};