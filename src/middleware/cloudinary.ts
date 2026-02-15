import { v2 as cloudinary } from "cloudinary";

import dotenv from "dotenv";
dotenv.config();



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dqswf244s",
  api_key: process.env.CLOUDINARY_API_KEY || "945682592389545",
  api_secret: process.env.CLOUDINARY_API_SECRET || "PNZrfIhi8GyKe-QjcrWU3QuLsw0",
});


export default cloudinary