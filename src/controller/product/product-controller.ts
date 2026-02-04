import { Request, Response } from 'express';

import Product from '../../database/models/product-model';


class ProductController {
  // Get all products
  static async getAllProducts(req: Request, res: Response) {
    try {
      const products = await Product.find()
        .populate('category')
        .populate('brand');

      res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }
  
}

export default ProductController;
