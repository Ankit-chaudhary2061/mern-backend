import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dqswf244s",
  api_key: process.env.CLOUDINARY_API_KEY || "945682592389545",
  api_secret: process.env.CLOUDINARY_API_SECRET || "PNZrfIhi8GyKe-QjcrWU3QuLsw0",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "broadway", 
      allowed_formats: ["jpg", "png", "jpeg", "webp"], 
      public_id: file.originalname.split(".")[0], 
    };
  },
});
export const deleteFromCloudinary = async (publicId: string) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
    console.log("Image deleted from Cloudinary:", publicId);
  } catch (error) {
    console.error("Failed to delete image:", error);
  }
};

export default storage;