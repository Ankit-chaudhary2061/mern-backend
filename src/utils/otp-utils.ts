import crypto from "crypto";

export const createOtp = (length = 6): string => {
  let otp = "";

  for (let i = 0; i < length; i++) {
    otp += crypto.randomInt(0, 10);
  }

  return otp;
};
