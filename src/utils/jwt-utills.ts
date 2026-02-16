import { IJwtPayload } from "../types/global-types";
import jwt from "jsonwebtoken";

export const signAccessToken = (payload: IJwtPayload) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "30d", 
  });
};
