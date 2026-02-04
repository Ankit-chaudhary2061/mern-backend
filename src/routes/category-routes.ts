import express, {Router} from 'express'
import CategoryController from '../controller/category/category-controller';


const router:Router =  express.Router();



router.get('/categories', CategoryController.getAllCategories)
router.post("/categories", CategoryController.createCategory);
router.put("/categories/:id", CategoryController.updateCategory);
router.delete("/categories/:id", CategoryController.deleteCategory);


export default router