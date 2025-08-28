
import models from '../models/index.js';
import fs from 'fs';


const {Menu} = models


export const getAllMenus = async (req, res) => {
  try {
    const menus = await Menu.findAll({
      order: [['display_order', 'ASC']] 
    });
    res.status(200).json(menus);
  } catch (error) {
    console.error("Error in getAllMenus:", error);
    res.status(500).json({ message: "Error fetching menus", error: error.message });
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
    res.status(500).json({ message: "Error fetching menu", error: error.message });
  }
};
export const createMenu = async (req, res) => {
  try {
    const { title_en, title_od, description_en, description_od, link, status } = req.body;
    
    const imageUrl = req.file 
      ? req.file.path.replace(/\\/g, "/").replace(/^public[\\/]*/, "") 
      : null;
    
    const newMenu = await Menu.create({
      title_en, title_od, description_en, description_od,  
      link, status, image_url: imageUrl
    });

    res.status(201).json({ message: "Menu created successfully!", data: newMenu });
  } catch (error) {

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Error in createMenu:", error);
    res.status(500).json({ message: "Error creating menu", error: error.message });
  }
};


export const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findByPk(id);

    if (!menu) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Menu not found" });
    }

    const { title_en, title_od, description_en, description_od, link, status } = req.body;
    
    const updatedData = {
      title_en, title_od, description_en, description_od, link, status
    };

    if (req.file) {
    
      const oldImagePath = menu.image_url ? `public/${menu.image_url}` : null;
      if (oldImagePath && fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
      }
      
  updatedData.image_url = req.file.path.replace(/\\/g, "/").replace(/^public[\\/]*/, "");
    }

    await menu.update(updatedData);
    res.status(200).json({ message: "Menu updated successfully!", data: menu });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }
    console.error("Error in updateMenu:", error);
    res.status(500).json({ message: "Error updating menu", error: error.message });
  }
};

/**
 * 5
 *    Route: DELETE /api/menus/:id
 */
export const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findByPk(id);

    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }


    const imagePath = menu.image_url ? `public/${menu.image_url}` : null;
    if (imagePath && fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }

    await menu.destroy();
    res.status(200).json({ message: "Menu deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMenu:", error);
    res.status(500).json({ message: "Error deleting menu", error: error.message });
  }
};
export const updateMenuOrder = async (req, res) => {
    // Frontend se 'order' naam ka ek array aayega, jismein IDs naye kram mein honge
    const { order } = req.body; 

    // Check karein ki 'order' ek array hai ya nahi
    if (!Array.isArray(order)) {
        return res.status(400).json({ message: "Invalid data format. 'order' must be an array of IDs." });
    }

    // Database transaction shuru karein taaki saare updates ek saath hon
    const t = await sequelize.transaction();

    try {
        // Promise.all ka istemal karke saare updates ko ek saath chalaayein
        await Promise.all(order.map((id, index) =>
            Menu.update(
                { display_order: index }, // 'display_order' ko naye index se set karein
                { where: { id: id }, transaction: t } // Sirf uss ID waale menu ko update karein
            )
        ));

        await t.commit(); // Agar saare updates safal rahe, to transaction ko save karein
        res.status(200).json({ message: "Menu order updated successfully." });
    } catch (error) {
        await t.rollback(); // Agar koi bhi update fail hua, to saare badlav waapas le lein
        console.error("Error updating menu order:", error);
        res.status(500).json({ message: "Failed to update menu order.", error: error.message });
    }
};
export const updateMenuStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate the incoming status
        if (status !== 'Active' && status !== 'Inactive') {
            return res.status(400).json({ message: "Invalid status provided. Must be 'Active' or 'Inactive'." });
        }

        const menu = await Menu.findByPk(id);
        if (!menu) {
            return res.status(404).json({ message: "Menu not found." });
        }

        // Update only the status field
        menu.status = status;
        await menu.save();

        res.status(200).json({ message: "Menu status updated successfully.", data: menu });

    } catch (error) {
        console.error("Error updating menu status:", error);
        res.status(500).json({ message: "Failed to update menu status.", error: error.message });
    }
};