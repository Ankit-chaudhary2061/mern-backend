import express, { Router } from "express";
import WishListController from "../controller/wishlist/wishlist-controller";
import { authenticate } from "../middleware/auth-middleware";
import { OnlyUser } from "../types/global-types";

const router:Router =  express.Router()

router.post('/wishlist',authenticate(...OnlyUser), WishListController.createWishlist)
router.get('/wishlist', WishListController.getAllWishlist)
export default router