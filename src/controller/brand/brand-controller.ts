import { Request, Response } from "express";
import { Brand } from "../../database/models/brand-model";
import storage, { deleteFromCloudinary } from "../../middleware/middleware-cloudinary";

class BrandController {
  static async getAllBrand(req: Request, res: Response) {
    try {
      const brands = await Brand.find();

      return res.status(200).json({
        success: true,
        count: brands.length,
        data: brands,
      });

    } catch (error: any) {
      console.error("Get all brand error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch brands",
        stack: error.stack,
      });
    }
  }
  static async singleBrand(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id ) {
      return res.status(400).json({
        success: false,
        message: "Invalid brand ID",
      });
    }

    const brand = await Brand.findById(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

 
    return res.status(200).json({
      success: true,
      data: brand,
    });

  } catch (error: any) {
    console.error("Single brand fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch brand",
      stack: error.stack,
    });
    }
    }
static async createBrand(req: Request, res: Response) {
  try {
    const { name, description } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    if (!name || !description || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Name, description and logo are required",
      });
    }


    const existingBrand = await Brand.findOne({ name });

    if (existingBrand) {
      return res.status(409).json({
        success: false,
        message: "Brand already exists",
      });
    }

    const brand = await Brand.create({
      name,
      description,
      logo: {
        path: imageUrl,
        public_id: req.file?.filename || "",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: brand,
    });

  } catch (error: any) {
    console.error("Create brand error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create brand",
      stack: error.stack,
    });
  }
}
static async deleteBrand(req: Request, res: Response) {
  try {
    const { id } = req.params;


    if (!id ) {
      return res.status(400).json({
        success: false,
        message: "Invalid brand ID",
      });
    }

   
    const brand = await Brand.findById(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    

if (brand.logo?.public_id) {
  await deleteFromCloudinary(brand.logo.public_id);
}
    
    await Brand.findByIdAndDelete(id);

 
    return res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
    });

  } catch (error: any) {
    console.error("Delete brand error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete brand",
      stack: error.stack,
    });
  }
}
static async updateBrand(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Brand id is required",
      });
    }

    const brand = await Brand.findById(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Please provide required data",
      });
    }

    
    brand.name = name;
    brand.description = description;

    
    if (imageUrl && req.file) {
      if (brand.logo?.public_id) {
        await deleteFromCloudinary(brand.logo.public_id);
      }

      brand.logo = {
        public_id: req.file.filename,
        path: imageUrl,
      };
    }

    await brand.save();

    return res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      data: brand,
    });

  } catch (error: any) {
    console.error("Update brand error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update brand",
      stack: error.stack,
    });
  }
}


}

export default BrandController;
