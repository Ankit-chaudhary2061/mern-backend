

import mongoose from "mongoose";
import { UserRole } from "../../types/enum-types";



const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      // unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    //   unique: true,
    select :false
    },
     role: {
      type: String,
      enum: Object.values(UserRole), // only admin | customer allowed
      default: UserRole.CUSTOMER,    // default role
    },
    active:{
        type:Boolean,
        default:false
    },
    isVerified:{
        type:Boolean,
        default:false
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;


