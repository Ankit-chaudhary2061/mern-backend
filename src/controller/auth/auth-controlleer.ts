import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../../database/models/user-model";
import { UserRole } from "../../types/enum-types";




class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;

      // 1️⃣ Validate input
      if (!username || !email || !password) {
        res.status(400).json({
          success: false,
          message: "All fields are required",
        });
        return;
      }

      // 2️⃣ Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: "Email already registered",
        });
        return;
      }

      // 3️⃣ Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 4️⃣ Create user
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        role: UserRole.CUSTOMER, // default role
      });
      await user.save();

      // 5️⃣ Send response
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
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
}

export default AuthController;
