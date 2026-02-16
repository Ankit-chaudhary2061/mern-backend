import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../database/models/user-model"; // make sure path is correct
import { IJwtPayload } from "../types/global-types";

export const authenticate = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      
      const token = req.cookies?.access_token;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Access denied. No token provided.",
        });
      }

    
      const secret = process.env.JWT_SECRET || "supersecretkey123"; 
      const decoded = jwt.verify(token, secret) as IJwtPayload & { exp?: number };
      if(!decoded){
         return res.status(401).json({
          success: false,
          message: "Invalid  token.",
        });
      }
    
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return res.status(401).json({
          success: false,
          message: "Token has expired. Please login again.",
        });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }
      
      next();

    } catch (error: any) {
      console.error("Authentication error:", error);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }
  };
};
