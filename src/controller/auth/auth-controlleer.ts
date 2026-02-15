import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../../database/models/user-model";
import { UserRole } from "../../types/enum-types";
import { createOtp } from "../../utils/otp-utils";




class AuthController {
 static async register(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, password } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    // 1️⃣ Validate input
    if (!username || !email || !password) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
      return;
    }

    // 2️⃣ Check if user exists
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

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

        static async login(req:Request , res:Response){
            try {
                const {email, password} = req.body;
                const user = await User.findOne({email});
                if (!user) {
                    res.status(404).json({
                        success: false,
                        message: "User not found",
                    });
                    return;
                }
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    res.status(401).json({
                        success: false,
                        message: "Invalid credentials",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Login successful",
                    data: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                    },
                });
            } catch (error :any) {
                 console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        stack:error.stack
      });
            }
        }
}

export default AuthController;
