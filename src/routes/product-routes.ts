import express, { Router } from 'express';
import multer from 'multer';
import storage from '../middleware/middleware-cloudinary';
import ProductController from '../controller/product/product-controller';
import { OnlyAdmin } from '../types/global-types';
import { authenticate } from '../middleware/auth-middleware';

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

const router: Router = express.Router();

// Public routes
router.get('/products', ProductController.getAllProducts);
router.get('/products/featured', ProductController.getAllFeature);
router.get('/products/arrivals', ProductController.getAllNewArrival);

router.get('/products/:id', ProductController.singleProduct);

// Admin-only route
router.post(
  '/product',
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'image', maxCount: 5 }
  ]),
  authenticate(...OnlyAdmin),
  ProductController.createProduct
);
router.patch('/product/:id', upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'image', maxCount: 5 }
  ]), authenticate(...OnlyAdmin), ProductController.updateProduct)
router.delete('/product/:id', authenticate(...OnlyAdmin), ProductController.deleteProduct)


export default router;
