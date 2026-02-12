import { Request, Response } from "express";
import User from "../../database/models/user-model";
import { promises } from "dns";


class UserController {
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await User.find().select("-password"); 

      res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: users,
      });
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async getUserById(req:Request, res:Response):Promise<void>{
    try {
      const { id } = req.params;
      const user = await User.findById(id).select("-password");
      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: user,
      });
    } catch (error) {
      console.error("Get user by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

export default UserController;
