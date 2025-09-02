import models from '../models/index.js';
import { Op } from 'sequelize';

const {ChatbotCategory} = models

// Get all categories with pagination and search
export const getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [
          { en: { [Op.like]: `%${search}%` } },
          { od: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    const { count, rows: categories } = await ChatbotCategory.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['order', 'ASC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      categories,
      totalCategories: count,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
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
    const { en, od, status = 'Active', image = '' } = req.body;

    if (!en || !od) {
      return res.status(400).json({
        success: false,
        message: 'Both English and Odia names are required'
      });
    }
   
    // Check for duplicate category
    const existingCategory = await ChatbotCategory.findOne({
      where: {en: {[Op.eq]: en}}
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
      en,
      od,
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

    const { en, od, status, image } = req.body;
    
    if (en && en !== category.en) {
      // ✅ FIXED: Changed Op.iLike to Op.like for MySQL compatibility
      const existingCategory = await ChatbotCategory.findOne({
        where: { 
          en: { [Op.like]: en }, // Changed from Op.iLike to Op.like
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

    if (en !== undefined) category.en = en;
    if (od !== undefined) category.od = od;
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