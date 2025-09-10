import models from '../../models/index.js';
import { Op } from 'sequelize';

const {ChatbotCategory} = models

// Get all categories with pagination and search
export const getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "order"; 
    const sortOrder = req.query.order || "ASC";

    const allowedSortColumns = ["en_title", "od_title", "status", "order", "createdAt"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    const whereClause = {
      ...(search && {
        [Op.or]: [
          { en_title: { [Op.like]: `%${search}%` } },
          { od_title: { [Op.like]: `%${search}%` } }
        ]
      })
    };

    const { count, rows } = await ChatbotCategory.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    // Return data in the standard format { total, data }
    res.status(200).json({
      total: count,
      data: rows
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};


// Get single category
export const getCategory = async (req, res) => {
  try {
    const category = await ChatbotCategory.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
};

// Create new category
export const createCategory = async (req, res) => {
  try {
    const { en_title, od_title, status = 'Active', image = '' } = req.body;

    if (!en_title || !od_title) {
      return res.status(400).json({
        success: false,
        message: 'Both English and Odia names are required'
      });
    }
   
    // Check for duplicate category
    const existingCategory = await ChatbotCategory.findOne({
      where: {en_title: {[Op.eq]: en_title}}
    });
    
    if(existingCategory){
      return res.status(400).json({
        success: false,
        message: 'Category with this English name already exists'
      });
    }

    const highestOrderCategory = await ChatbotCategory.findOne({
      order: [['order', 'DESC']]
    });
    
    const order = highestOrderCategory ? highestOrderCategory.order + 1 : 0;

    const category = await ChatbotCategory.create({
      en_title,
      od_title,
      status,
      image,
      order
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const category = await ChatbotCategory.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const { en_title, od_title, status, image } = req.body;
    
    if (en_title && en_title !== category.en_title) {
      // ✅ FIXED: Changed Op.iLike to Op.like for MySQL compatibility
      const existingCategory = await ChatbotCategory.findOne({
        where: { 
          en_title: { [Op.like]: en_title }, // Changed from Op.iLike to Op.like
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'A category with this English name already exists'
        });
      }
    }

    if (en_title !== undefined) category.en_title = en_title;
    if (od_title !== undefined) category.od_title = od_title;
    if (status !== undefined) category.status = status;
    if (image !== undefined) category.image = image;

    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const category = await ChatbotCategory.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await category.destroy();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
};

// Update category order
export const updateCategoryOrder = async (req, res) => {
  try {
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: 'Categories array is required'
      });
    }

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      await ChatbotCategory.update(
        { order: i },
        { where: { id: category.id } }
      );
    }

    res.json({
      success: true,
      message: 'Category order updated successfully'
    });
  } catch (error) {
    console.error('Error updating category order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category order',
      error: error.message
    });
  }
};