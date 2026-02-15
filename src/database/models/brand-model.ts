import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    logo: {
      public_id: {
        type: String,
        required: true,
      },
      path: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Brand = mongoose.model("Brand", brandSchema);
