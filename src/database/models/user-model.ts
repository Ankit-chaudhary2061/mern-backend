

import mongoose from "mongoose";
import { UserRole } from "../../types/enum-types";
import { url } from "inspector";



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
    },
  phoneNumber: {
  type: Number,
  required: false
},
profileImage: {
  type: {
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String, 
      required: false
    }
  },
  required: false,
  default: null  
},
otp: {
  type: String,
  select: false
},
otpExpires: {
  type: Date
}



  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;


