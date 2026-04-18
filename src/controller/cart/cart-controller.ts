import { Request, Response } from "express";
import Cart from "../../database/models/cart-model";

class CartController {


  static async addToCart(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { productId, quantity = 1 } = req.body;

      if (!userId || !productId) {
        return res.status(400).json({
          success: false,
          message: "User and Product ID required",
        });
      }

      let cart = await Cart.findOne({ user: userId });

      if (!cart) {
        cart = new Cart({
          user: userId,
          items: [{ product: productId, quantity }],
        });
      } else {
        const index = cart.items.findIndex(
          item => item.product.toString() === productId
        );

        if (index > -1) {
          cart.items[index].quantity += quantity;
        } else {
          cart.items.push({ product: productId, quantity });
        }
      }

      await cart.save();

      res.status(200).json({
        success: true,
        message: "Added to cart 🛒",
        data: cart,
      });

    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }


  static async getCart(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      const cart = await Cart.findOne({ user: userId })
        .populate("items.product");

      res.status(200).json({
        success: true,
        data: cart || [],
      });

    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }


  static async updateCartItem(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { productId } = req.params;
      const { quantity } = req.body;

      const cart = await Cart.findOne({ user: userId });

      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      const item = cart.items.find(
        item => item.product.toString() === productId
      );

      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      item.quantity = quantity;

      await cart.save();

      res.status(200).json({
        success: true,
        message: "Cart updated",
        data: cart,
      });

    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }


static async removeItem(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID required",
      });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const initialLength = cart.items.length;

    // remove item
    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    ) as typeof cart.items;

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Item removed successfully 🗑️",
      data: cart,
    });

  } catch (error: any) {
    console.error("Remove item error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}


  static async clearCart(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      const cart = await Cart.findOne({ user: userId });

      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      cart.items = [] as any;

      await cart.save();

      res.status(200).json({
        success: true,
        message: "Cart cleared 🧹",
      });

    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default CartController;