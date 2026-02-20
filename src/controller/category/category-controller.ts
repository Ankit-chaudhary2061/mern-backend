import { Request, Response } from "express";
import Category from "../../database/models/category-models";
import { paginationMetaData } from "../../utils/pagination-utills";


class CategoryController {
  // Get all categories
  static async getAllCategories(req: Request, res: Response) {
    try {
      const {query, page = 1, limit = 10}= req.query
      const pageNum = parseInt(page as string, 10)
      const pageLimit = parseInt(limit as string,10)
      const skip = (pageNum - 1) * pageLimit

     const filter: Record<string, any> = {};

    if (query && String(query).trim() !== "") {
  filter.$or = [
    { tittle: { $regex: query, $options: "i" } },
    { description: { $regex: query, $options: "i" } }
  ];
    }

      const [categories, totalCount] = await Promise.all([
  Category.find(filter)
    .limit(pageLimit)
    .skip(skip)
    .sort({ createdAt: -1 }),

  Category.countDocuments(filter)
]);

      res.status(200).json({
        success: true,
        count: categories.length,
        data: categories,
        pagination:paginationMetaData(pageNum, pageLimit, totalCount),
        message:'categories fetched successfully'
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
