import { NextFunction, Request, Response } from "express";
import bcrypt, { compare } from "bcryptjs";
import User from "../../database/models/user-model";
import { UserRole } from "../../types/enum-types";
import { createOtp, resend_Otp } from "../../utils/otp-utils";
import { sendMail } from "../../utils/send-mail";
import { otpVerificationHtml } from "../../utils/email-utils";
import { signAccessToken } from "../../utils/jwt-utills";
import crypto from 'crypto';
import jwt from "jsonwebtoken";
import { IJwtPayload } from "../../types/global-types";
// import { access } from "fs";




class AuthController {
 static async register(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, password } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    
    if (!username || !email || !password) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
      return;
    }

  
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "Email already registered",
      });
      return;
    }

   
    const otp = createOtp();

  
    const otpHash = await bcrypt.hash(otp, 10);

    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: UserRole.CUSTOMER,
      otp: otpHash,
      otpExpires: new Date(Date.now() + 5 * 60 * 1000),
      profileImage: imageUrl ? { url: imageUrl } : null,
    });
await sendMail({
  to: user.email,
  subject: "Verify Your Email - OTP Code",
  html: otpVerificationHtml(user, otp),
});

    res.status(201).json({
      success: true,
      message: "User registered successfully. OTP sent to email.",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
    
  } catch (error :any ) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
        stack:error.stack

    });
  }
}

static async login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }


    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before login",
      });
    }

   
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const access_token = signAccessToken({
      id:user._id ,
      email:user.email,
      role:user.role
    })
  res.cookie("access_token", access_token, {
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: "none", // required for cross-site frontend/backend
  maxAge: 30 * 24 * 60 * 60 * 1000,
}).status(200).json({
      success: true,
      message: "Login successful",
    data: {
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role
},
    });

  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      stack: error.stack,
    });
  }
}

 static async otpVerification(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      // Validation
      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: "Email and OTP are required",
        });
      }

      // Find user
      const user = await User.findOne({ email }).select(
        "+otp +otpExpires"
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // OTP existence check
      if (!user.otp || !user.otpExpires) {
        return res.status(400).json({
          success: false,
          message: "OTP not found. Please request a new OTP.",
        });
      }

      // Expiry check
      if (Date.now() > user.otpExpires.getTime()) {
        return res.status(400).json({
          success: false,
          message: "OTP expired. Please request a new OTP.",
        });
      }

      // Debug logs
      console.log("=================================");
      console.log("Entered OTP:", otp.toString().trim());
      console.log("Database Hash:", user.otp);

      // Compare OTP
      const otpMatched = await bcrypt.compare(
        otp.toString().trim(),
        user.otp
      );

      console.log("Matched:", otpMatched);
      console.log("=================================");

      // Invalid OTP
      if (!otpMatched) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      // Verify account
      user.isVerified = true;

      user.set({
        otp: null,
        otpExpires: null,
      });

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Account verified successfully",
      });

    } catch (error: any) {
      console.error("OTP VERIFY ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Server Error",
        stack: error.stack,
      });
    }
  }
static async resendOtp(req: Request, res: Response) {
  try {
    const { email } = req.body;

  
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

 
    const user = await User.findOne({ email }).select("+otp +otpExpires");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

   
    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: "Account is already verified",
      });
    }

  
    await resend_Otp(user);

    return res.status(200).json({
      success: true,
      message: "New OTP has been sent to your email",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}
static async logout(req: Request, res: Response) {
  try {
    
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });

  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
static async forgotPassword(req:Request, res:Response){
  try {
    const{email}=req.body;
     if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    const user = await User.findOne({email})
     if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
     const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenHash = await bcrypt.hash(resetToken, 12); // store hash
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = resetTokenExpires;

    await user.save();
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}?email=${user.email}`;
    await sendMail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>Hi ${user.username},</p>
        <p>Click the link below to reset your password. The link is valid for 15 minutes.</p>
        <a href="${resetLink}" target="_blank">Reset Password</a>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email ",
      resetToken: resetToken
    });
  }catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
static async resetPassword (req:Request, res:Response){
try {
  const{token, email , newPassword}=req.body
   if (!email || !token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const user = await User.findOne({ email }).select("+resetPasswordToken +resetPasswordExpires");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
     if (!user.resetPasswordToken || !user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
      return res.status(400).json({
        success: false,
        message: "Token is invalid or expired",
      });
    }
     const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isTokenValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }
// Update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
console.log("DB Token:", user.resetPasswordToken);
console.log("Request Token:", token);
    // Clear reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
static async me(req: Request, res: Response) {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        user: null,
      });
    }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as IJwtPayload;

const userId = decoded.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        user: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      user: null,
    });
  }
}

}

export default AuthController;
