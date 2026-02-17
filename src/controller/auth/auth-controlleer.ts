import { NextFunction, Request, Response } from "express";
import bcrypt, { compare } from "bcryptjs";
import User from "../../database/models/user-model";
import { UserRole } from "../../types/enum-types";
import { createOtp, resend_Otp } from "../../utils/otp-utils";
import { sendMail } from "../../utils/send-mail";
import { otpVerificationHtml } from "../../utils/email-utils";
import { signAccessToken } from "../../utils/jwt-utills";
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
      otpExpires: Date.now() + 5 * 60 * 1000, 
      profileImage: imageUrl ? { url: imageUrl } : null,
    });
await sendMail({
  to: user.email,
  subject: "Verify Your Email - OTP Code",
  html: otpVerificationHtml(user, otp),
});



   await user.save()

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
      id:user.id,
      email:user.email,
      role:user.role
    })
    res.cookie('access_token', access_token,{
      httpOnly:process.env.NODE_ENV === 'development' ? false:true,
      sameSite:process.env.NODE_ENV === 'development' ? 'lax':'none',
      secure:process.env.NODE_ENV === 'development' ? false:true,
      maxAge: 30 * 24 * 60 * 60 * 1000  


    }).status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token:access_token
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

 static async otpVerfication(
  req: Request,
  res: Response,
  next: NextFunction
) {
          try {
           const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }
   const user = await User.findOne({ email }).select("+otp +otpExpires");

if (!user) {
  return res.status(404).json({
    success: false,
    message: "User not found",
  });
}
if (!user.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.otpExpires) {
  const isOtpExpired = new Date(Date.now()) > user.otpExpires;

  if (isOtpExpired) {
    return res.status(400).json({
      success: false,
      message: "OTP has expired. Please request a new one.",
    });
  }
}
  const otpMatch = await bcrypt.compare(otp, user.otp);

    if (!otpMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully 🎉",
    });

  } catch (error: any) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      stack: error.stack,
    });
  }
}
static async resendOtp(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.body;

 
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

 
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
if (user.isVerified) {
  return res.status(400).json({
    success: false,
    message: "User already verified. No need to resend OTP.",
  });
}

 
    await resend_Otp(user);

    
    return res.status(200).json({
      success: true,
      message: "New OTP sent successfully to your email",
    });

  } catch (error: any) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
      stack: error.stack,
    });
  }
}

}

export default AuthController;
