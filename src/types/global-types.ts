import mongoose from "mongoose";
import { UserRole } from "./enum-types";

export interface IJwtPayload {
  id: mongoose.Types.ObjectId;         
  role: UserRole;
  email: string;
}
export const OnlyAdmin = [UserRole.ADMIN]
export const OnlyUser = [UserRole.CUSTOMER]
