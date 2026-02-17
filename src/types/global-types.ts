import { UserRole } from "./enum-types";

export interface IJwtPayload {
  id: string;         
  role: UserRole;
  email: string;
}
export const OnlyAdmin = [UserRole.ADMIN]
export const OnlyUser = [UserRole.CUSTOMER]
