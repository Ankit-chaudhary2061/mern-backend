import crypto from "crypto";
import bcrypt from 'bcrypt'
import { otpVerificationHtml } from "./email-utils";
import { sendMail } from "./send-mail";
export const createOtp = (length = 6): string => {
  let otp = "";

  for (let i = 0; i < length; i++) {
    otp += crypto.randomInt(0, 10);
  }

  return otp;
};



export const resend_Otp = async (user: any) => {
  
  const newOtp = createOtp();

 
  const newOtpHash = await bcrypt.hash(newOtp.toString(), 10);
const otpExpiry = new Date( Date.now() + 10 * 60 * 1000 )

  user.otp = newOtpHash;
  user.otpExpires = otpExpiry

  await user.save();

  
  await sendMail({
    to: user.email,
    subject: "Your New OTP Code",
    html: otpVerificationHtml(user, newOtp),
  });

  return true;
};
