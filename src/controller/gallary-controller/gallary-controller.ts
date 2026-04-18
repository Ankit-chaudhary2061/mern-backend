import { Request, Response } from "express";
import Gallary from "../../database/models/gallary-model";
import { deleteFromCloudinary } from "../../middleware/middleware-cloudinary";



class GalleryController {
  static async uploadImage(req: Request, res: Response) {
    try {
   
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({
          message: "No images uploaded",
        });
      }

      const files = req.files as Express.Multer.File[];


      const images = files.map((file) => ({
        path: file.path,        // Cloudinary URL
        publicId: file.filename // Cloudinary public_id
      }));

      const gallery = await Gallary.create({
        image: images,
      });

      return res.status(201).json({
        success: true,
        message: "Images uploaded successfully",
        gallery,
      });

    } catch (error: any) {
      console.error("Upload Image Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to upload images",
        error: error.message,
      });
    }
  }
  static async getGalley(req:Request, res:Response){
    try {
        const gallery = await Gallary.find();
        return res.status(200).json({
            success:true,
            messages:"gallery fetched successfully",
            data:gallery
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch gallery",
            error: error.message,
        });
    }
  }
 static async deleteImage(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const gallery = await Gallary.findById(id);

    if (!gallery || gallery.image.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    const galleryImage = gallery.image[0];

    // delete from cloudinary
    await deleteFromCloudinary(galleryImage.publicId);

    // remove from array
    gallery.image.splice(0, 1);

    await gallery.save();

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      data: gallery,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete image",
      error: error.message,
    });
  }
}
static async fetchSingleImage(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const gallery = await Gallary.findById(id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Gallery fetched successfully",
      data: gallery.image,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch image",
    });
  }
}
}

export default GalleryController;