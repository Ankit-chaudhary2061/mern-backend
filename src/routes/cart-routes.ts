import express, { Router } from "express";
import { authenticate } from "../middleware/auth-middleware";
import { OnlyUser } from "../types/global-types";
import CartController from "../controller/cart/cart-controller";


const router:Router = express.Router()

router.post('/cart/clear', authenticate(...OnlyUser),CartController.clearCart)
router.post('/cart', authenticate(...OnlyUser),CartController.createCart)
router.post('/removecart', authenticate(...OnlyUser),CartController.removeCart)
router.get('/cart', authenticate(...OnlyUser),CartController.getCart)



export default router