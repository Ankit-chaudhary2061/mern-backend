import express, {Router} from 'express'

import UserController from '../controller/auth/user-comtroller';



const router:Router =  express.Router();

router.get("/users", UserController.getAllUsers);
router.get("/user/:id", UserController.getUserById);
export default router
