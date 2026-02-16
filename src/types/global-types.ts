import { UserRole } from "./enum-types";

export interface IJwtPayload {
  id: string;         
  role: UserRole;
  email: string;
}
