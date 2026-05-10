import express from "express";
import CartController from "../controller/cart/cart-controller";

import { OnlyUser } from "../types/global-types";
import { authenticate } from "../middleware/auth-middleware";

const router = express.Router();

router.post("/cart", authenticate(...OnlyUser), CartController.addToCart);
router.get("/cart", authenticate(...OnlyUser), CartController.getCart);
router.patch("/cart/:productId", authenticate(...OnlyUser), CartController.updateCartItem);
router.delete("/cart/:productId", authenticate(...OnlyUser), CartController.removeItem);
router.delete("/cart", authenticate(...OnlyUser), CartController.clearCart);

export default router;