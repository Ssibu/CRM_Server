import fs from 'fs';
import models from '../models/index.js';

// Sequelize models
const {SubMenu, Menu} = models

// ====================================================================
// 1. Create a new SubMenu
// ====================================================================
export const createSubMenu = async (req, res) => {
  try {

    const { menuId, title_en, title_od, description_en, description_od, link, status } = req.body;

    if (!menuId || !title_en || !title_od) {
      return res.status(400).json({ message: "Parent Menu ID, Title (English), and Title (Odia) are required." });
    }

    const imageUrl = req.file 
      ? req.file.path.replace(/\\/g, "/").replace(/^public[\\/]*/, "") 
      : null;

    const newSubMenu = await SubMenu.create({
      menuId,
      title_en,
      title_od,
      description_en,
      description_od,  
      link,
      status,
      image_url: imageUrl
    });

    res.status(201).json({ message: "Sub-Menu created successfully!", data: newSubMenu });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Error creating sub-menu:", error);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(404).json({ message: `Parent Menu with ID '${req.body.menuId}' not found.` });
    }
    res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

// ====================================================================
// 2. Get all SubMenus
// ====================================================================
export const getAllSubMenus = async (req, res) => {
  try {
    const subMenus = await SubMenu.findAll({
      order: [['display_order', 'ASC']],
      include: {
          model: Menu,
          as: 'Menu',
          attributes: ['title_en']
      }
    });
    res.status(200).json(subMenus);
  } catch (error) {
    console.error("Error fetching sub-menus:", error);
    res.status(500).json({ message: "Error fetching sub-menus", error: error.message });
  }
};

// ====================================================================
// 3. Get a single SubMenu by ID
// ====================================================================
export const getSubMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    const subMenu = await SubMenu.findByPk(id);
    if (!subMenu) {
      return res.status(404).json({ message: "Sub-Menu not found" });
    }
    res.status(200).json(subMenu);
  } catch (error) {
    console.error("Error fetching sub-menu by ID:", error);
    res.status(500).json({ message: "Error fetching sub-menu", error: error.message });
  }
};

// ====================================================================
// 4. Update an existing SubMenu
// ====================================================================
export const updateSubMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const subMenu = await SubMenu.findByPk(id);

    if (!subMenu) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Sub-Menu not found" });
    }
    
  
    const { menuId, title_en, title_od, description_en, description_od, link, status } = req.body;
    
    // Instance ko field-by-field update karein
    subMenu.menuId = menuId !== undefined ? menuId : subMenu.menuId;
    subMenu.title_en = title_en !== undefined ? title_en : subMenu.title_en;
    subMenu.title_od = title_od !== undefined ? title_od : subMenu.title_od;
    subMenu.description_en = description_en !== undefined ? description_en : subMenu.description_en;
    subMenu.description_od = description_od !== undefined ? description_od : subMenu.description_od;
    subMenu.link = link !== undefined ? link : subMenu.link;
    subMenu.status = status !== undefined ? status : subMenu.status;

    if (req.file) {
      const oldImagePath = subMenu.image_url ? `public/${subMenu.image_url}` : null;
      if (oldImagePath && fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
      }
      subMenu.image_url = req.file.path.replace(/\\/g, "/").replace(/^public[\\/]*/, "");
    }

    await subMenu.save();
    res.status(200).json({ message: "Sub-Menu updated successfully!", data: subMenu });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }
    console.error("Error updating sub-menu:", error);
    res.status(500).json({ message: "Error updating sub-menu", error: error.message });
  }
};

// ====================================================================
// 5. Delete a SubMenu
// ====================================================================
export const deleteSubMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const subMenu = await SubMenu.findByPk(id);

    if (!subMenu) {
      return res.status(404).json({ message: "Sub-Menu not found" });
    }

    const imagePath = subMenu.image_url ? `public/${subMenu.image_url}` : null;
    if (imagePath && fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }

    await subMenu.destroy();
    res.status(200).json({ message: "Sub-Menu deleted successfully" });
  } catch (error) {
    console.error("Error deleting sub-menu:", error);
    res.status(500).json({ message: "Error deleting sub-menu", error: error.message });
  }
};

// ====================================================================
// 6. Update Display Order
// ====================================================================
export const updateSubMenuOrder = async (req, res) => {
    const { order } = req.body;
    if (!Array.isArray(order)) {
        return res.status(400).json({ message: "Invalid data format. 'order' must be an array of IDs." });
    }
    const t = await sequelize.transaction();
    try {
        await Promise.all(order.map((id, index) =>
            SubMenu.update({ display_order: index }, { where: { id: id }, transaction: t })
        ));
        await t.commit();
        res.status(200).json({ message: "Sub-Menu order updated successfully." });
    } catch (error) {
        await t.rollback();
        console.error("Error updating submenu order:", error);
        res.status(500).json({ message: "Failed to update order.", error: error.message });
    }
};
export const updateSubMenuStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate the incoming status
        if (status !== 'Active' && status !== 'Inactive') {
            return res.status(400).json({ message: "Invalid status provided. Must be 'Active' or 'Inactive'." });
        }

        const subMenu = await SubMenu.findByPk(id);
        if (!subMenu) {
            return res.status(404).json({ message: "SubMenu not found." });
        }

        // Update only the status field
        subMenu.status = status;
        await subMenu.save();

        res.status(200).json({ message: "SubMenu status updated successfully.", data: subMenu });

    } catch (error) {
        console.error("Error updating submenu status:", error);
        res.status(500).json({ message: "Failed to update submenu status.", error: error.message });
    }
};