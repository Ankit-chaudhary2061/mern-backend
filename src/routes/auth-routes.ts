import express, {Router} from 'express'
import AuthController from '../controller/auth/auth-controlleer';
import multer from 'multer';
import storage from '../middleware/middleware-cloudinary';

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});


const router:Router =  express.Router();

router.post("/register",  upload.single("image"),AuthController.register);
router.post("/login", AuthController.login);

export default router
