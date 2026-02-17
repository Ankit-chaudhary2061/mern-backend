import { Request, Response } from 'express';

import Product from '../../database/models/product-model';
import Category from '../../database/models/category-models';
import { Brand } from '../../database/models/brand-model';


class ProductController {
  // Get all products
  static async getAllProducts(req: Request, res: Response) {
    try {
      const products = await Product.find()
        .populate('category')
        .populate('brand');

      res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }
 static async singleProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await Product.findById(id)
      .populate("category")
      .populate("brand");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });

  } catch (error: any) {
    console.error("Single product error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
}
// static async createProduct(req: Request, res: Response) {
//   try {
//     const {
//       name,
//       description,
//       category,
//       brand,
//       isfeature,
//       stock,
//       newArrival,
//     } = req.body;

//     const imageUrl = req.file ? req.file.path : null;


//     if (!name || !description || stock === undefined || !imageUrl) {
//       return res.status(400).json({
//         success: false,
//         message: "All required fields must be provided",
//       });
//     }

  
//     const productCategory = await Category.findOne({ where: { id: category } });
//     if (!productCategory) {
//       return res.status(404).json({
//         success: false,
//         message: "Category not found",
//       });
//     }

//     const productBrand = await Brand.findOne({ where: { id: brand } });
//     if (!productBrand) {
//       return res.status(404).json({
//         success: false,
//         message: "Brand not found",
//       });
//     }

    
//     const product = await Product.create({
//       name,
//       description,
//       category: productCategory.id,
//       brand: productBrand.id,
//       isfeature,
//       stock,
//       newArrival,
//       // image: imageUrl,
//     });
   
//     return res.status(201).json({
//       success: true,
//       message: "Product created successfully",
//       data: product,
//     });

//   } catch (error: any) {
//     console.error("Create product error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// }


}

export default ProductController;
