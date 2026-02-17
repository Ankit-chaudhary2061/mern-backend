import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../database/models/user-model"; // make sure path is correct
import { IJwtPayload } from "../types/global-types";
import { UserRole } from "../types/enum-types";

export const authenticate = (...role:UserRole[] ) => {
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
    res.clearCookie("access_token", {
    httpOnly: process.env.NODE_ENV !== "development",
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
    secure: process.env.NODE_ENV !== "development",
    });

    return res.status(401).json({
    success: false,
    message: "Token has expired. Please login again.",
    });
  }


      const user = await User.findOne({where:{email :decoded.email}});
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }
      if (role.length && !role.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You do not have permission.",
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
