import express, {Router} from 'express'

import UserController from '../controller/auth/user-comtroller';
import multer from 'multer';
import storage from '../middleware/middleware-cloudinary';

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

const router:Router =  express.Router();

router.get("/users", UserController.getAllUsers);
router.get("/user/:id", UserController.getUserById);
export default router
