import express, {Router} from 'express'
import AuthController from '../controller/auth/auth-controlleer';



const router:Router =  express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

export default router
