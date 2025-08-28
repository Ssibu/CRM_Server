// backend/controllers/SubSubMenuController.js

import fs from 'fs';
import models from '../models/index.js';

const {Menu, SubSubMenu, SubMenu} = models

// 1. Create a new Sub-SubMenu
export const createSubSubMenu = async (req, res) => {
  try {
    const { subMenuId, title_en, title_od, description_en, description_od, link, status, meta_title, meta_keyword, meta_description } = req.body;

    if (!subMenuId || !title_en || !title_od) {
      return res.status(400).json({ message: "Parent SubMenu ID and titles are required." });
    }

    const imageUrl = req.file ? req.file.path.replace(/\\/g, "/").replace(/^public[\\/]*/, "") : null;

    const newSubSubMenu = await SubSubMenu.create({
      subMenuId, title_en, title_od, description_en, description_od, link, status,
      image_url: imageUrl, meta_title, meta_keyword, meta_description
    });

    res.status(201).json({ message: "Sub-SubMenu created successfully!", data: newSubSubMenu });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("Error creating sub-submenu:", error);
    res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

// 2. Get all Sub-SubMenus (with nested parents)
export const getAllSubSubMenus = async (req, res) => {
  try {
    const subSubMenus = await SubSubMenu.findAll({
      order: [['display_order', 'ASC']],
      include: {
          model: SubMenu,
          as: 'SubMenu',
          attributes: ['title_en', 'menuId'], // Also fetch menuId for the next level
          include: {
            model: Menu,
            as: 'Menu',
            attributes: ['title_en']
          }
      }
    });
    res.status(200).json(subSubMenus);
  } catch (error) {
    console.error("Error fetching sub-submenus:", error);
    res.status(500).json({ message: "Error fetching sub-submenus", error: error.message });
  }
};

// 3. Get a single Sub-SubMenu by ID
export const getSubSubMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    const subSubMenu = await SubSubMenu.findByPk(id);
    if (!subSubMenu) return res.status(404).json({ message: "Sub-SubMenu not found" });
    res.status(200).json(subSubMenu);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sub-submenu", error: error.message });
  }
};

// 4. Update an existing Sub-SubMenu
export const updateSubSubMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const subSubMenu = await SubSubMenu.findByPk(id);
    if (!subSubMenu) return res.status(404).json({ message: "Sub-SubMenu not found" });

    const { subMenuId, title_en, title_od, description_en, description_od, link, status, meta_title, meta_keyword, meta_description } = req.body;
    
    // Update fields
    subSubMenu.subMenuId = subMenuId;
    subSubMenu.title_en = title_en;
    subSubMenu.title_od = title_od;
    subSubMenu.description_en = description_en;
    subSubMenu.description_od = description_od;
    subSubMenu.link = link;
    subSubMenu.status = status;
    subSubMenu.meta_title = meta_title;
    subSubMenu.meta_keyword = meta_keyword;
    subSubMenu.meta_description = meta_description;

    if (req.file) {
      const oldImagePath = subSubMenu.image_url ? `public/${subSubMenu.image_url}` : null;
      if (oldImagePath && fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      subSubMenu.image_url = req.file.path.replace(/\\/g, "/").replace(/^public[\\/]*/, "");
    }

    await subSubMenu.save();
    res.status(200).json({ message: "Sub-SubMenu updated successfully!", data: subSubMenu });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("Error updating sub-submenu:", error);
    res.status(500).json({ message: "Error updating sub-submenu", error: error.message });
  }
};

// 5. Delete a Sub-SubMenu
export const deleteSubSubMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const subSubMenu = await SubSubMenu.findByPk(id);
    if (!subSubMenu) return res.status(404).json({ message: "Sub-SubMenu not found" });

    if (subSubMenu.image_url) {
      const imagePath = `public/${subSubMenu.image_url}`;
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await subSubMenu.destroy();
    res.status(200).json({ message: "Sub-SubMenu deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting sub-submenu", error: error.message });
  }
};

// 6. Update Display Order
export const updateSubSubMenuOrder = async (req, res) => {
    const { order } = req.body;
    if (!Array.isArray(order)) return res.status(400).json({ message: "Invalid data format." });

    const t = await sequelize.transaction();
    try {
        await Promise.all(order.map((id, index) =>
            SubSubMenu.update({ display_order: index }, { where: { id }, transaction: t })
        ));
        await t.commit();
        res.status(200).json({ message: "Order updated successfully." });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: "Failed to update order.", error: error.message });
    }
};
export const updateSubSubMenuStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate the incoming status
        if (status !== 'Active' && status !== 'Inactive') {
            return res.status(400).json({ message: "Invalid status provided. Must be 'Active' or 'Inactive'." });
        }

        const subSubMenu = await SubSubMenu.findByPk(id);
        if (!subSubMenu) {
            return res.status(404).json({ message: "Sub-SubMenu not found." });
        }

        // Update only the status field
        subSubMenu.status = status;
        await subSubMenu.save();

        res.status(200).json({ message: "Sub-SubMenu status updated successfully.", data: subSubMenu });

    } catch (error) {
        console.error("Error updating sub-submenu status:", error);
        res.status(500).json({ message: "Failed to update sub-submenu status.", error: error.message });
    }
};