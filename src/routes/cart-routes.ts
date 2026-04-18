import express from "express";
import CartController from "../controller/cart/cart-controller";

import { OnlyUser } from "../types/global-types";
import { authenticate } from "../middleware/auth-middleware";

const router = express.Router();

router.post("/", authenticate(...OnlyUser), CartController.addToCart);
router.get("/", authenticate(...OnlyUser), CartController.getCart);
router.patch("/:productId", authenticate(...OnlyUser), CartController.updateCartItem);
router.delete("/:productId", authenticate(...OnlyUser), CartController.removeItem);
router.delete("/", authenticate(...OnlyUser), CartController.clearCart);

export default router;