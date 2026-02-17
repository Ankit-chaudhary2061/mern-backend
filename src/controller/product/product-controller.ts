import { Request, Response } from 'express';

import Product from '../../database/models/product-model';
import Category from '../../database/models/category-models';
import { Brand } from '../../database/models/brand-model';
import { deleteFromCloudinary } from '../../middleware/middleware-cloudinary';
interface IExpressFile{
  coverImage?:Express.Multer.File[],
  image?:Express.Multer.File[],

}

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
static async createProduct(req: Request, res: Response) {
  try {
    const {
      name,
      description,
      category,
      brand,
      isFeatured,
      stock,
      newArrival,
    } = req.body;

    const files = req.files as IExpressFile;

    const coverImageFile = files?.coverImage?.[0];
    const imageFiles = files?.image;

    if (
      !name ||
      !description ||
      stock === undefined ||
      !coverImageFile ||
      !imageFiles ||
      imageFiles.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const productCategory = await Category.findOne({ where: { id: category } });
    if (!productCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const productBrand = await Brand.findOne({ where: { id: brand } });
    if (!productBrand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    const coverImage = {
      path: coverImageFile.path,
      publicId: coverImageFile.filename,
    };

    const images = imageFiles.map((file) => ({
      path: file.path,
      publicId: file.filename,
    }));

  const product = await Product.create({
  name,
  description,
  category: productCategory.id,
  brand: productBrand.id,
  isFeatured,
  stock,
  newArrival,
  coverImage,
  image: images,
});


    return res.status(201).json({
      success: true,
      message: "Product created successfully 🎉",
      data: product,
    });

  } catch (error: any) {
    console.error("Create product error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
}

static async updateProduct(req:Request, res:Response){
  try {
     const{
      name, description, stock, brand, category,isFeatured,newArrival, price
     }=req.body;
     const{id}=req.params
     if(!id){
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      })
     }
     const product = await Product.findById(id)
     if(!product){
      return res.status(400).json({
         success: false,
          message: "Product not found",
        });
      
     }
     if(category){
      const productCategory =  await Category.findById(category)
      if (!productCategory) {
          return res.status(404).json({
            success: false,
            message: "Category not found",
          });
        }
        product.category = productCategory._id;
     }
     if(brand){
      const productBrand = await Brand.findById(brand)
      if(!productBrand){
        return res.status(404).json({
          success:false,
          message:'Brand not found'
        })
      }
      product.brand = productBrand._id
     }
      if (name) product.name = name;
      if (description) product.description = description;
      if (stock !== undefined) product.stock = stock;
      if (price !== undefined) product.price = price;
      if (isFeatured !== undefined) product.isFeatured = isFeatured;
      if (newArrival !== undefined) product.newArrival = newArrival;


const files = req.files as IExpressFile;
const coverImageFile = files?.coverImage?.[0];
const imageFiles = files?.image;

if (coverImageFile && product.coverImage?.publicId) {
  await deleteFromCloudinary(product.coverImage.publicId);
}


if (imageFiles && product.image && product.image.length > 0) {
  await Promise.all(
    product.image.map(img => deleteFromCloudinary(img.publicId))
  );
}

if (coverImageFile) {
    product.coverImage = {
    path: coverImageFile.path,
    publicId: coverImageFile.filename
  };
}

if (imageFiles && imageFiles.length > 0) {
  product.image = imageFiles.map(file => ({
    path: file.path,
    publicId: file.filename,
  })) as any; 
}

await product.save();

  } catch (error :any) {
     console.error("Update product error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
  }
}



static async deleteProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;

  
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.coverImage?.publicId) {
      await deleteFromCloudinary(product.coverImage.publicId);
    }


    if (product.image && product.image.length > 0) {
      await Promise.all(product.image.map(img => deleteFromCloudinary(img.publicId)));
    }

  
     await Product.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error: any) {
    console.error("Delete product error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
}
static async getAllFeature(req: Request, res: Response) {
  try {
   
    const products = await Product.find({ isFeatured: true });

    return res.status(200).json({
      success: true,
      message: "Featured products  fetch successfully",
      data: products,
    });
  } catch (error: any) {
    console.error("Get featured products error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
}
// static async markAsFeatured(req: Request, res: Response) {
//   try {
//     const { id } = req.params;

//     
//     const product = await Product.findByIdAndUpdate(
//       id,
//       { isFeatured: true },
//       { new: true } 
//     );

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Product marked as featured",
//       data: product,
//     });

//   } catch (error: any) {
//     console.error("Error marking product as featured:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// }

static async getAllNewArrival(req:Request, res:Response){
  try {
    const product =  await Product.find({newArrival:true})
   return res.status(200).json({
      success: true,
      message: "new products  fetch successfully",
      data: product,
    });
  } catch (error: any) {
    console.error("Get new arrival products error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
}
// static async markAsNewArrival(req: Request, res: Response) {
//   try {
//     const { id } = req.params;

    
//     const product = await Product.findByIdAndUpdate(
//       id,
//       { newArrival: true },
//       { new: true } 
//     );

  
//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

   
//     return res.status(200).json({
//       success: true,
//       message: "Product marked as new arrival",
//       data: product,
//     });

//   } catch (error: any) {
//     console.error("Error marking product as new arrival:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// }

}

export default ProductController;
