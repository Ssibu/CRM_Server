import { DataTypes, Op } from 'sequelize';
import sequelize from '../../config/db.js';
import models from '../models/index.js';
import fs from 'fs';

const { Menu } = models;

// Validation function for menu data
const validateMenuData = (data, isUpdate = false) => {
  const errors = {};
  
  // Required field validation
  if (!data.title_en || data.title_en.trim() === '') {
    errors.title_en = 'English title is required';
  }
  
  if (!data.title_od || data.title_od.trim() === '') {
    errors.title_od = 'Odia title is required';
  }
  
  // Image validation (not required for updates if image already exists)
  if (!isUpdate && (!data.image_url || data.image_url.trim() === '')) {
    errors.image_url = 'Image is required';
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

export const getAllMenusForTree = async (req, res) => {
  try {
    const menus = await Menu.findAll({
      order: [['display_order', 'ASC']] 
    });
    res.status(200).json(menus);
  } catch (error) {
    console.error("Error in getAllMenus:", error);
    res.status(500).json({ message: "Error fetching menus. Please try again later.", error: error.message });
  }
};




// Replace your existing getAllMenus with this new, more powerful version
export const getAllMenus = async (req, res) => {
  try {
    // 1. Get query parameters for pagination, search, and sort
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "display_order"; // Default sort by display order
    const sortOrder = req.query.order || "ASC";

    // Whitelist allowed sortable columns
    const allowedSortColumns = ["title_en", "title_od", "status", "createdAt", "display_order"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    // Build search clause
    const whereClause = {
      ...(search && {
        [Op.or]: [
          { title_en: { [Op.like]: `%${search}%` } },
          { title_od: { [Op.like]: `%${search}%` } },
        ],
      })
    };

    // 2. Use findAndCountAll for server-side operations
    const { count, rows } = await Menu.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limit,
      offset: offset,
    });

    // 3. Return data in the format our hook expects
    res.status(200).json({
      total: count,
      data: rows,
    });
    
  } catch (error) {
    console.error("Error in getAllMenus:", error);
    res.status(500).json({ message: "Error fetching menus.", error: error.message });
  }
};

export const getMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findByPk(id);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }
    res.status(200).json(menu);
  } catch (error) {
    console.error("Error in getMenuById:", error);
    res.status(500).json({ message: "Error fetching menu details. Please try again later.", error: error.message });
  }
};




const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const createMenu = async (req, res) => {
  let transaction;
  try {
    const { title_en, title_od, description_en, description_od, link, status } = req.body;

    // Validate required fields
    const validation = validateMenuData({ title_en, title_od, image_url: req.file ? 'exists' : '' });
    if (!validation.isValid) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.errors
      });
    }

    // Check for duplicate titles
    const existingMenu = await Menu.findOne({
      where: {
        [Op.or]: [
          { title_en: title_en.trim() },
          { title_od: title_od.trim() }
        ]
      }
    });

    if (existingMenu) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      let errorMessage = "A menu with the same ";
      if (existingMenu.title_en === title_en.trim()) {
        errorMessage += "English title already exists";
      } else {
        errorMessage += "Odia title already exists";
      }
      return res.status(409).json({ message: errorMessage });
    }
    
    const slug = generateSlug(title_en);
    const existingSlug = await Menu.findOne({ where: { slug: slug } });

    if (existingSlug) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(409).json({ message: "A menu with a similar slug already exists. Please choose a different title." });
    }

    const imageUrl = req.file
      ? req.file.path.replace(/\\/g, "/").replace(/^public[\\/]*/, "")
      : null;

    transaction = await sequelize.transaction();

    const newMenu = await Menu.create({
      title_en: title_en.trim(),
      title_od: title_od.trim(),
      slug: slug, 
      description_en: description_en ? description_en.trim() : null,
      description_od: description_od ? description_od.trim() : null,
      link: link ? link.trim() : null,
      status: status || 'Active',
      image_url: imageUrl
    }, { transaction });

    await transaction.commit();

    res.status(201).json({ message: "Menu created successfully!", data: newMenu });
  } catch (error) {
    if (transaction) await transaction.rollback();

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error("Error in createMenu:", error);

    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ message: "Validation error", errors });
    }

    res.status(500).json({ message: "Failed to create menu. Please try again later.", error: error.message });
  }
};




export const updateMenu = async (req, res) => {
  let transaction;
  try {
    const { id } = req.params;
    const menu = await Menu.findByPk(id);

    if (!menu) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Menu not found" });
    }

    const { title_en, title_od, description_en, description_od, link, status, remove_image } = req.body;

    transaction = await sequelize.transaction();

    const updatedData = {
      title_en: title_en ? title_en.trim() : menu.title_en,
      title_od: title_od ? title_od.trim() : menu.title_od,
      description_en: description_en !== undefined ? description_en.trim() : menu.description_en,
      description_od: description_od !== undefined ? description_od.trim() : menu.description_od,
      link: link !== undefined ? link.trim() : menu.link,
      status: status || menu.status,
    };

    // Case 1: User uploaded a new image
    if (req.file) {
      const oldImagePath = menu.image_url ? `public/${menu.image_url}` : null;
      if (oldImagePath && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      updatedData.image_url = req.file.path.replace(/\\/g, "/").replace(/^public[\\/]+/, "");
    }

    // Case 2: User explicitly requested removal
    else if (remove_image === "true") {
      const oldImagePath = menu.image_url ? `public/${menu.image_url}` : null;
      if (oldImagePath && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      updatedData.image_url = null;
    }

    await menu.update(updatedData, { transaction });
    await transaction.commit();

    // 🔑 Refresh the menu object after update
    const updatedMenu = await Menu.findByPk(id);

    res.status(200).json({
      message: "Menu updated successfully!",
      data: updatedMenu,
    });

  } catch (error) {
    if (transaction) await transaction.rollback();
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Error in updateMenu:", error);
    res.status(500).json({
      message: "Failed to update menu. Please try again later.",
      error: error.message,
    });
  }
};



export const updateMenuStatus = async (req, res) => {
  let transaction;
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 'Active' && status !== 'Inactive') {
      return res.status(400).json({ message: "Invalid status. Status must be either 'Active' or 'Inactive'." });
    }

    transaction = await sequelize.transaction();
    
    const menu = await Menu.findByPk(id, { transaction });
    if (!menu) {
      await transaction.rollback();
      return res.status(404).json({ message: "Menu not found." });
    }

    await menu.update({ status }, { transaction });
    await transaction.commit();
    
    res.status(200).json({ message: "Menu status updated successfully.", data: menu });

  } catch (error) {
    if (transaction) await transaction.rollback();
    
    console.error("Error updating menu status:", error);
    res.status(500).json({ message: "Failed to update menu status. Please try again later.", error: error.message });
  }
};


export const getAllMenusForSort = async (req, res) => {
  try {
    const menus = await Menu.findAll({
      order: [['display_order', 'ASC']] 
    });
    res.status(200).json(menus);
  } catch (error) {
    res.status(500).json({ message: "Error fetching menus for sorting." });
  }
};

// NEW: Controller to update the display_order of all menus
export const updateMenuOrder = async (req, res) => {
    const { order } = req.body; // Expects an array of IDs: [3, 1, 2]
    if (!Array.isArray(order)) {
        return res.status(400).json({ message: "Invalid order data." });
    }

    const transaction = await sequelize.transaction();
    try {
        // Use Promise.all to run all updates concurrently within a transaction
        await Promise.all(order.map((id, index) => 
            Menu.update(
                { display_order: index + 1 }, // Set the order based on the array index
                { where: { id: id }, transaction }
            )
        ));

        await transaction.commit();
        res.status(200).json({ message: "Menu order updated successfully." });
    } catch (error) {
        await transaction.rollback();
        console.error("Error updating menu order:", error);
        res.status(500).json({ message: "Failed to update menu order." });
    }
};

export default {
  getAllMenus,
  getMenuById,
  createMenu,
  updateMenu,
  updateMenuStatus
};