import express, { Router } from 'express';
import GalleryController from '../controller/gallary-controller/gallary-controller';
import { OnlyAdmin } from '../types/global-types';
import { authenticate } from '../middleware/auth-middleware';
import multer from 'multer';
import storage from '../middleware/middleware-cloudinary';
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

const router: Router = express.Router();


router.post('/upload', upload.fields([{ name: 'images', maxCount: 20 }]), authenticate(...OnlyAdmin), GalleryController.uploadImage);
router.get('/gallery', GalleryController.getGalley);
router.delete('/delete/:publicId', authenticate(...OnlyAdmin), GalleryController.deleteImage);
router.get('/gallery/:id', GalleryController.fetchSingleImage);

export default router;