import { Request, Response } from "express";
import Cart from "../../database/models/cart-model";
import { runInNewContext } from "vm";


class CartController{
    static async clearCart(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

   
    cart.items = [] as any;
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully 🛒",
    });

  } catch (error: any) {
    console.error("Delete cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}
// static async deleteCartItem(req: Request, res: Response) {
//   try {
//     const userId = req.user?.id;
//     const { productId } = req.body;

//     if (!userId || !productId) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID and Product ID are required",
//       });
//     }

//     const cart = await Cart.findOne({ user: userId });

//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         message: "Cart not found",
//       });
//     }

//     // Remove only that product from cart
//     cart.items = cart.items.filter(
//       item => item.product.toString() !== productId
//     );

//     await cart.save();

//     return res.status(200).json({
//       success: true,
//       message: "Product removed from cart 🗑️",
//       data: cart,
//     });

//   } catch (error: any) {
//     console.error("Delete cart item error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// }
static async createCart(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const qty = quantity ? Number(quantity) : 1;

    let cart = await Cart.findOne({ user: userId });

    // If cart does not exist → create new
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity: qty }],
      });

      await cart.save();

      return res.status(201).json({
        success: true,
        message: "Product added to cart 🛒",
        data: cart,
      });
    }

    // Check if product already exists in cart
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    // If exists, increase quantity
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += qty;
    } else {
      // Else → push new product
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully 🛒",
      data: cart,
    });

  } catch (error: any) {
    console.error("Create cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

static async removeCart(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required",
      });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const index = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    cart.items.splice(index, 1); // delete ONLY ONE item

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}
static async getCart(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        populate: [
          { path: "category", select: "name" },
          { path: "brand", select: "name logo" }
        ]
      })
      .populate({
        path: "user",
        select: "_id username email role profileImage"
      });

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: cart,
      message: "Fetch cart",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}



}

export default CartController