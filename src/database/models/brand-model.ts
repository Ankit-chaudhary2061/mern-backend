import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    logo: {
      type: String,
      required: true,
      trim: true
  
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Brand", brandSchema);
