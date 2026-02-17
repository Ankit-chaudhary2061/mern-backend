import { Request, Response } from "express";
import WishList from "../../database/models/wishlist-model";
import Product from "../../database/models/product-model";

class WishListController {
 static async createWishlist(req: Request, res: Response) {
  try {
    const { productId } = req.body;
    const userId = req.user?.id;

    if (!productId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Product ID and User ID are required",
      });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    const existing = await WishList.findOne({
      user: userId,
      product: productId,
    });

    
    if (existing) {
      await existing.deleteOne();

      return res.status(200).json({
        success: true,
        message: `Product ${productId} removed from wishlist `,
      });
    }

  
    const wishlist = await WishList.create({
      user: userId,
      product: productId,
    });

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist ",
      data: wishlist,
    });

  } catch (error: any) {
    console.error("Wishlist toggle error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}
static async getAllWishlist(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID not found",
      });
    }

  
    const list = await WishList.find({ user: userId }).populate("product");

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      data: list,
    });

  } catch (error: any) {
    console.error("Get wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

static async clearWishlist(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID not found",
      });
    }


    await WishList.deleteMany({ user: userId });

    return res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
    });

  } catch (error: any) {
    console.error("Clear wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}


}

export default WishListController;
