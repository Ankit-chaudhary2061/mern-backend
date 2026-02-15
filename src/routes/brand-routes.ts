import express, {Router} from 'express'
import BrandController from '../controller/brand/brand-controller';
import multer from 'multer';
import storage from '../middleware/middleware-cloudinary';

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});



const router:Router =  express.Router();

router.get("/brands", BrandController.getAllBrand)
router.get("/brand/:id", BrandController.singleBrand);
router.post('/brand',upload.single('logo') ,BrandController.createBrand)
export default router
