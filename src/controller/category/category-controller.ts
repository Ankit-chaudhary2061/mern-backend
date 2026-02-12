import { Request, Response } from "express";
import Category from "../../database/models/category-models";


class CategoryController {
  // Get all categories
  static async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await Category.find();

      res.status(200).json({
        success: true,
        count: categories.length,
        data: categories
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message
      });
    }
  }

  static async singleCategory(req:Request, res:Response) {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found"
        });
      }

      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message
      });
    }
  }
static async createCategory(req: Request, res: Response) {
  try {
    const { name, description } = req.body;

 
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Name and description are required"
      });
    }

  
    const existingCategory = await Category.findOne({ title: name });
    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category with this name already exists"
      });
    }

   
    const category = await Category.create({ title: name, description });

    res.status(201).json({
      success: true,
      data: category
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
}

// static async deleteCategory(req: Request, res: Response) {
//   try {
//     const { id } = req.params;

//     // Validate ID
//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Category ID is required"
//       });
//     }

//     // Find category
//     const category = await Category.findById(id);
//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: "Category not found"
//       });
//     }

//     // Delete category
//     await category.remove();

//     res.status(200).json({
//       success: true,
//       message: "Category deleted successfully"
//     });

//   } catch (error: any) {
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message
//     });
//   }
// }
static async deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;


    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required"
      });
    }


    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

 
    await Category.deleteOne({ id: id }); 


    res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
}
static async updateCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

   
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required"
      });
    }

  
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Name and description are required"
      });
    }

   
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

  
    category.title = name;
    category.description = description;

    await category.save();

  
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
}

}

export default CategoryController;
