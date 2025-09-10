
import { Op } from 'sequelize';
import fs from 'fs';
import models from '../../models/index.js';
import sequelize from '../../../config/db.js';
// Sequelize models
const { SubMenu, Menu } = models;



const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Validation function for submenu data
const validateSubMenuData = (data, isUpdate = false) => {
  const errors = {};
  
  // Required field validation
  if (!data.menuId) {
    errors.menuId = 'Parent Menu ID is required';
  }
  
  if (!data.en_title || data.en_title.trim() === '') {
    errors.en_title = 'English title is required';
  }
  
  if (!data.od_title || data.od_title.trim() === '') {
    errors.od_title = 'Odia title is required';
  }
  
  // Status validation
  if (data.status && !['Active', 'Inactive'].includes(data.status)) {
    errors.status = 'Status must be either Active or Inactive';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
export const getAllSubMenusWithoutPagination = async (req, res) => {
  try {
    const subMenus = await SubMenu.findAll({ order: [['display_order', 'ASC']] });
    res.status(200).json(subMenus);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all sub-menus for dropdown." });
  }
};
export const createSubMenu = async (req, res) => {
  let transaction;
  try {
    const { menuId, en_title, od_title, en_description, od_description, link, status } = req.body;
    
    // Validate required fields
    const validation = validateSubMenuData({ menuId, en_title, od_title, status });
    if (!validation.isValid) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validation.errors 
      });
    }
    
    // Check if parent menu exists
    const parentMenu = await Menu.findByPk(menuId);
    if (!parentMenu) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: `Parent Menu with ID '${menuId}' not found.` });
    }
    
    // Check for duplicate titles
    const existingSubMenu = await SubMenu.findOne({
      where: {
        [Op.or]: [
          { en_title: en_title.trim() },
          { od_title: od_title.trim() }
        ]
      }
    });
    
    if (existingSubMenu) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      let errorMessage = "A submenu with the same ";
      if (existingSubMenu.en_title === en_title.trim()) {
        errorMessage += "English title already exists";
      } else {
        errorMessage += "Odia title already exists";
      }
      
      return res.status(409).json({ message: errorMessage });
    }

      const slug = generateSlug(en_title);
    const existingSlug = await SubMenu.findOne({ where: { slug: slug } });

    if (existingSlug) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(409).json({ message: "A sub menu with a similar slug already exists. Please choose a different title." });
    }
    
    const imageUrl = req.file 
      ? req.file.path.replace(/\\/g, "/").replace(/^public[\\/]*/, "") 
      : null;
    
    transaction = await sequelize.transaction();
    
    const newSubMenu = await SubMenu.create({
      menuId,
      en_title: en_title.trim(),
      od_title: od_title.trim(),
       slug: slug, 
      en_description: en_description ? en_description.trim() : null,
      od_description: od_description ? od_description.trim() : null,  
      link: link ? link.trim() : null,
      status: status || 'Active',
      image_url: imageUrl
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({ message: "Sub-Menu created successfully!", data: newSubMenu });
  } catch (error) {
    if (transaction) await transaction.rollback();
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error("Error creating sub-menu:", error);
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(404).json({ message: `Parent Menu with ID '${req.body.menuId}' not found.` });
    }
    
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ message: "Validation error", errors });
    }
    
    res.status(500).json({ message: "Failed to create submenu. Please try again later.", error: error.message });
  }
};



export const getAllSubMenus = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "display_order";
    const sortOrder = req.query.order || "ASC";

    const allowedSortColumns = ["en_title", "od_title", "status", "createdAt", "display_order", "parent_menu"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    const whereClause = {
      ...(search && {
        [Op.or]: [
          { en_title: { [Op.like]: `%${search}%` } },
          { od_title: { [Op.like]: `%${search}%` } },
          { '$Menu.en_title$': { [Op.like]: `%${search}%` } },
        ],
      })
    };

    const { count, rows } = await SubMenu.findAndCountAll({
      where: whereClause,
      include: {
        model: Menu,
        as: 'Menu',
        attributes: [], 
      },
 
      attributes: {
        include: [
          [sequelize.col('Menu.en_title'), 'parent_menu']
        ]
      },
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
      distinct: true,
    });
    
    res.status(200).json({
      total: count,
      data: rows,
    });
    
  } catch (error) {
    console.error("Error fetching sub-menus:", error);
    res.status(500).json({ message: "Error fetching sub-menus.", error: error.message });
  }
};

export const getAllSubMenusForSort = async (req, res) => {
  try {
    const subMenus = await SubMenu.findAll({
      order: [['display_order', 'ASC']],
      include: { model: Menu, as: 'Menu', attributes: ['en_title'] }
    });
    res.status(200).json(subMenus);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sub-menus for sorting." });
  }
};

export const updateSubMenuOrder = async (req, res) => {
    const { order } = req.body;
    if (!Array.isArray(order)) {
        return res.status(400).json({ message: "Invalid order data." });
    }
    const transaction = await sequelize.transaction();
    try {
        await Promise.all(order.map((id, index) => 
            SubMenu.update(
                { display_order: index + 1 },
                { where: { id: id }, transaction }
            )
        ));
        await transaction.commit();
        res.status(200).json({ message: "SubMenu order updated successfully." });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: "Failed to update submenu order." });
    }
};

export const getSubMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    const subMenu = await SubMenu.findByPk(id, {
      include: {
        model: Menu,
        as: 'Menu',
        attributes: ['en_title']
      }
    });
    
    if (!subMenu) {
      return res.status(404).json({ message: "Sub-Menu not found" });
    }
    res.status(200).json(subMenu);
  } catch (error) {
    console.error("Error fetching sub-menu by ID:", error);
    res.status(500).json({ message: "Error fetching sub-menu. Please try again later.", error: error.message });
  }
};

export const updateSubMenu = async (req, res) => {
  let transaction;
  try {
    const { id } = req.params;

    transaction = await sequelize.transaction();

    const subMenu = await SubMenu.findByPk(id, { transaction });

    if (!subMenu) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Sub-Menu not found" });
    }

    const { 
      menuId, 
      en_title, 
      od_title, 
      en_description, 
      od_description, 
      link, 
      status, 
      remove_image 
    } = req.body;

    // Validation
    const validation = validateSubMenuData(
      {
        menuId: menuId !== undefined ? menuId : subMenu.menuId,
        en_title: en_title !== undefined ? en_title : subMenu.en_title,
        od_title: od_title !== undefined ? od_title : subMenu.od_title,
        status: status !== undefined ? status : subMenu.status,
      },
      true
    );

    if (!validation.isValid) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // Parent menu check (if menuId is updated)
    if (menuId && menuId !== subMenu.menuId) {
      const parentMenu = await Menu.findByPk(menuId, { transaction });
      if (!parentMenu) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        await transaction.rollback();
        return res
          .status(404)
          .json({ message: `Parent Menu with ID '${menuId}' not found.` });
      }
    }

    // Duplicate check
    if (en_title || od_title) {
      const whereCondition = {
        id: { [Op.ne]: id },
      };

      if (en_title && od_title) {
        whereCondition[Op.or] = [
          { en_title: en_title.trim() },
          { od_title: od_title.trim() },
        ];
      } else if (en_title) {
        whereCondition.en_title = en_title.trim();
      } else if (od_title) {
        whereCondition.od_title = od_title.trim();
      }

      const existingSubMenu = await SubMenu.findOne({
        where: whereCondition,
        transaction,
      });

      if (existingSubMenu) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        await transaction.rollback();

        let errorMessage = "Another submenu with the same ";
        if (en_title && existingSubMenu.en_title === en_title.trim()) {
          errorMessage += "English title already exists";
        } else {
          errorMessage += "Odia title already exists";
        }

        return res.status(409).json({ message: errorMessage });
      }
    }

    // Prepare updated data
    const updatedData = {
      menuId: menuId !== undefined ? menuId : subMenu.menuId,
      en_title: en_title !== undefined ? en_title.trim() : subMenu.en_title,
      od_title: od_title !== undefined ? od_title.trim() : subMenu.od_title,
      en_description:
        en_description !== undefined
          ? en_description.trim()
          : subMenu.en_description,
      od_description:
        od_description !== undefined
          ? od_description.trim()
          : subMenu.od_description,
      link: link !== undefined ? link.trim() : subMenu.link,
      status: status !== undefined ? status : subMenu.status,
    };

    // Case 1: New image upload
    if (req.file) {
      const oldImagePath = subMenu.image_url
        ? `public/${subMenu.image_url}`
        : null;
      if (oldImagePath && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      updatedData.image_url = req.file.path
        .replace(/\\/g, "/")
        .replace(/^public[\\/]+/, "");
    }
    // Case 2: Explicit image removal
    else if (remove_image === "true") {
      const oldImagePath = subMenu.image_url
        ? `public/${subMenu.image_url}`
        : null;
      if (oldImagePath && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      updatedData.image_url = null;
    }

    await subMenu.update(updatedData, { transaction });
    await transaction.commit();

    // Refresh after update
    const updatedSubMenu = await SubMenu.findByPk(id);

    res.status(200).json({
      message: "Sub-Menu updated successfully!",
      data: updatedSubMenu,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error("Error updating sub-menu:", error);

    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({ message: "Validation error", errors });
    }

    res.status(500).json({
      message: "Failed to update submenu. Please try again later.",
      error: error.message,
    });
  }
};

export const updateSubMenuStatus = async (req, res) => {
  let transaction;
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate the incoming status
    if (status !== 'Active' && status !== 'Inactive') {
      return res.status(400).json({ message: "Invalid status. Status must be either 'Active' or 'Inactive'." });
    }

    transaction = await sequelize.transaction();
    
    const subMenu = await SubMenu.findByPk(id, { transaction });
    if (!subMenu) {
      await transaction.rollback();
      return res.status(404).json({ message: "SubMenu not found." });
    }

    await subMenu.update({ status }, { transaction });
    await transaction.commit();
    
    res.status(200).json({ message: "SubMenu status updated successfully.", data: subMenu });

  } catch (error) {
    if (transaction) await transaction.rollback();
    
    console.error("Error updating submenu status:", error);
    res.status(500).json({ message: "Failed to update submenu status. Please try again later.", error: error.message });
  }
};



export default {
  createSubMenu,
  getAllSubMenus,
  getSubMenuById,
  updateSubMenu,
  updateSubMenuStatus,
  // deleteSubMenu
};