import { Op } from 'sequelize';
import fs from 'fs';
import models from '../../models/index.js';
import sequelize from '../../../config/db.js';
import { log } from '../../services/LogService.js';
const { Menu, SubSubMenu, SubMenu } = models;


const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Validation function for sub-submenu data
const validateSubSubMenuData = (data, isUpdate = false) => {
  const errors = {};
  
  // Required field validation
  if (!data.subMenuId) {
    errors.subMenuId = 'Parent SubMenu ID is required';
  }
  
  if (!data.en_title || data.en_title.trim() === '') {
    errors.en_title = 'English title is required';
  }else if (data.en_title.trim().length > 35) { // 
    errors.en_title = 'English title must not exceed 35 characters';
  }
  
  if (!data.od_title || data.od_title.trim() === '') {
    errors.od_title = 'Odia title is required';
  }else if (data.od_title.trim().length > 35) { // 
    errors.od_title = 'Odia title must not exceed 35 characters';
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

// 1. Create a new Sub-SubMenu
export const createSubSubMenu = async (req, res) => {
  let transaction;
  try {
    const { subMenuId, en_title, od_title, en_description, od_description, link, status, meta_title, meta_keyword, meta_description } = req.body;
    
    // Validate required fields
    const validation = validateSubSubMenuData({ subMenuId, en_title, od_title, status });
    if (!validation.isValid) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validation.errors 
      });
    }
    
    // Check if parent submenu exists
    const parentSubMenu = await SubMenu.findByPk(subMenuId);
    if (!parentSubMenu) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: `Parent SubMenu with ID '${subMenuId}' not found.` });
    }
    
    // Check for duplicate titles
    const existingSubSubMenu = await SubSubMenu.findOne({
      where: {
        [Op.or]: [
          { en_title: en_title.trim() },
          { od_title: od_title.trim() }
        ]
      }
    });
    
    if (existingSubSubMenu) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      let errorMessage = "A sub-submenu with the same ";
      if (existingSubSubMenu.en_title === en_title.trim()) {
        errorMessage += "English title already exists";
      } else {
        errorMessage += "Odia title already exists";
      }
      
      return res.status(409).json({ message: errorMessage });
    }

      const slug = generateSlug(en_title);
    const existingSlug = await SubSubMenu.findOne({ where: { slug: slug } });

    if (existingSlug) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(409).json({ message: "A sub sub menu with a similar slug already exists. Please choose a different title." });
    }
    
    const imageUrl = req.file 
      ? req.file.path.replace(/\\/g, "/").replace(/^public[\\/]*/, "") 
      : null;
    
    transaction = await sequelize.transaction();
    
    const newSubSubMenu = await SubSubMenu.create({
      subMenuId,
      en_title: en_title.trim(),
      od_title: od_title.trim(),
       slug: slug, 
      en_description: en_description ? en_description.trim() : null,
      od_description: od_description ? od_description.trim() : null,
      link: link ? link.trim() : null,
      status: status || 'Active',
      image_url: imageUrl,
      meta_title: meta_title ? meta_title.trim() : null,
      meta_keyword: meta_keyword ? meta_keyword.trim() : null,
      meta_description: meta_description ? meta_description.trim() : null
    }, { transaction });
    
    await transaction.commit();
     await log({
      req,
      action:"CREATE",
      page_name:"ADD SUB-SUBMENU",
      target:req.body.en_title
    })
    res.status(201).json({ message: "Sub-SubMenu created successfully!", data: newSubSubMenu });
  } catch (error) {
    if (transaction) await transaction.rollback();
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error("Error creating sub-submenu:", error);
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(404).json({ message: `Parent SubMenu with ID '${req.body.subMenuId}' not found.` });
    }
    
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ message: "Validation error", errors });
    }
    
    res.status(500).json({ message: "Failed to create sub-submenu. Please try again later.", error: error.message });
  }
};



export const getAllSubSubMenus = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "display_order";
    const sortOrder = req.query.order || "ASC";

    // --- FIX 1: Add the default sort key to the whitelist ---
    const allowedSortColumns = ["en_title", "od_title", "status", "parent_submenu", "parent_menu", "display_order"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    const whereClause = {
      ...(search && {
        [Op.or]: [
          { en_title: { [Op.like]: `%${search}%` } },
          { od_title: { [Op.like]: `%${search}%` } },
          { '$SubMenu.en_title$': { [Op.like]: `%${search}%` } },
          { '$SubMenu.Menu.en_title$': { [Op.like]: `%${search}%` } },
        ],
      })
    };

    // --- FIX 2: Add logic to handle sorting by aliased/joined columns ---
    let order;
    if (sortBy === 'parent_menu') {
        // Correctly reference the nested association for sorting
        order = [[{ model: SubMenu, as: 'SubMenu' }, { model: Menu, as: 'Menu' }, 'en_title', sortOrder.toUpperCase()]];
    } else if (sortBy === 'parent_submenu') {
        order = [[{ model: SubMenu, as: 'SubMenu' }, 'en_title', sortOrder.toUpperCase()]];
    } else {
        order = [[sortBy, sortOrder.toUpperCase()]];
    }

    const { count, rows } = await SubSubMenu.findAndCountAll({
      where: whereClause,
      include: [{
        model: SubMenu,
        as: 'SubMenu',
        attributes: [],
        include: [{
          model: Menu,
          as: 'Menu',
          attributes: [],
        }]
      }],
      attributes: {
        include: [
          [sequelize.col('SubMenu.en_title'), 'parent_submenu'],
          [sequelize.col('SubMenu.Menu.en_title'), 'parent_menu']
        ]
      },
      order: order, // Use the new dynamic order configuration
      limit,
      offset,
      distinct: true,
    });
     await log({
      req,
      action:"READ",
      page_name:"SUB-SUBMENU LIST",
    })
    res.status(200).json({
      total: count,
      data: rows,
    });
    
  } catch (error) {
    console.error("Error fetching sub-submenus:", error);
    res.status(500).json({ message: "Error fetching sub-submenus.", error: error.message });
  }
};
export const getAllSubSubMenusForSort = async (req, res) => {
  try {
    const subSubMenus = await SubSubMenu.findAll({
      order: [['display_order', 'ASC']],
    });
    res.status(200).json(subSubMenus);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sub-submenus for sorting." });
  }
};

export const updateSubSubMenuOrder = async (req, res) => {
    const { order } = req.body;
    if (!Array.isArray(order)) {
        return res.status(400).json({ message: "Invalid order data." });
    }
    const transaction = await sequelize.transaction();
    try {
        await Promise.all(order.map((id, index) => 
            SubSubMenu.update(
                { display_order: index + 1 },
                { where: { id: id }, transaction }
            )
        ));
        await transaction.commit();
        res.status(200).json({ message: "Sub-SubMenu order updated successfully." });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: "Failed to update order." });
    }
};
export const getAllSubSubMenusWithoutPagination = async (req, res) => {
  try {
    const rows = await SubSubMenu.findAll({
      include: [
        {
          model: SubMenu,
          as: "SubMenu",
          attributes: ["en_title", "od_title"],
          include: [
            {
              model: Menu,
              as: "Menu",
              attributes: ["en_title"],
            },
          ],
        },
      ],
      order: [["display_order", "ASC"]],
    });

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching all sub-submenus:", error);
    res.status(500).json({ message: "Error fetching sub-submenus.", error: error.message });
  }
};
// 3. Get a single Sub-SubMenu by ID
export const getSubSubMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    // const subSubMenu = await SubSubMenu.findByPk(id, {
    //   include: {
    //     model: SubMenu,
    //     as: 'SubMenu',
    //     attributes: ['en_title', 'menuId'],
    //     include: {
    //       model: Menu,
    //       as: 'Menu',
    //       attributes: ['en_title']
    //     }
    //   }
    // });
    const subSubMenu = await SubSubMenu.findByPk(id, {
  include: {
    model: SubMenu,
    as: 'SubMenu',
    attributes: ['en_title', 'menuId'],
    include: {
      model: Menu,
      as: 'Menu',
      attributes: ['en_title']
    }
  }
});

    
    if (!subSubMenu) {
      return res.status(404).json({ message: "Sub-SubMenu not found" });
    }
    
    res.status(200).json(subSubMenu);
  } catch (error) {
    console.error("Error fetching sub-submenu:", error);
    res.status(500).json({ message: "Error fetching sub-submenu. Please try again later.", error: error.message });
  }
};

// 4. Update an existing Sub-SubMenu
// 4. Update an existing Sub-SubMenu
export const updateSubSubMenu = async (req, res) => {
  let transaction;
  try {
    const { id } = req.params;
    transaction = await sequelize.transaction();

    const subSubMenu = await SubSubMenu.findByPk(id, { transaction });

    if (!subSubMenu) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Sub-SubMenu not found" });
    }

    const {
      subMenuId,
      en_title,
      od_title,
      en_description,
      od_description,
      link,
      status,
      meta_title,
      meta_keyword,
      meta_description,
      remove_image,   // frontend se aa raha flag
    } = req.body;

    //  Validation logic
    const validation = validateSubSubMenuData(
      {
        subMenuId: subMenuId !== undefined ? subMenuId : subSubMenu.subMenuId,
        en_title: en_title !== undefined ? en_title : subSubMenu.en_title,
        od_title: od_title !== undefined ? od_title : subSubMenu.od_title,
        status: status !== undefined ? status : subSubMenu.status,
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

    //  Parent SubMenu validation
    if (subMenuId && subMenuId !== subSubMenu.subMenuId) {
      const parentSubMenu = await SubMenu.findByPk(subMenuId, { transaction });
      if (!parentSubMenu) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        await transaction.rollback();
        return res
          .status(404)
          .json({ message: `Parent SubMenu with ID '${subMenuId}' not found.` });
      }
    }

    //  Duplicate check
    if (en_title || od_title) {
      const whereCondition = { id: { [Op.ne]: id } };

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

      const existingSubSubMenu = await SubSubMenu.findOne({
        where: whereCondition,
        transaction,
      });

      if (existingSubSubMenu) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        await transaction.rollback();

        let errorMessage = "A sub-submenu with the same ";
        if (existingSubSubMenu.en_title === en_title?.trim()) {
          errorMessage += "English title already exists";
        } else {
          errorMessage += "Odia title already exists";
        }

        return res.status(409).json({ message: errorMessage });
      }
    }

    //  Prepare update data
    const updatedData = {
      subMenuId: subMenuId !== undefined ? subMenuId : subSubMenu.subMenuId,
      en_title:
        en_title !== undefined ? en_title.trim() : subSubMenu.en_title,
      od_title:
        od_title !== undefined ? od_title.trim() : subSubMenu.od_title,
      en_description:
        en_description !== undefined
          ? en_description.trim()
          : subSubMenu.en_description,
      od_description:
        od_description !== undefined
          ? od_description.trim()
          : subSubMenu.od_description,
      link: link !== undefined ? link.trim() : subSubMenu.link,
      status: status !== undefined ? status : subSubMenu.status,
      meta_title:
        meta_title !== undefined ? meta_title.trim() : subSubMenu.meta_title,
      meta_keyword:
        meta_keyword !== undefined
          ? meta_keyword.trim()
          : subSubMenu.meta_keyword,
      meta_description:
        meta_description !== undefined
          ? meta_description.trim()
          : subSubMenu.meta_description,
    };

    // Image update logic
    if (req.file) {
      // Delete old image if exists
      const oldImagePath = subSubMenu.image_url
        ? `public/${subSubMenu.image_url}`
        : null;
      if (oldImagePath && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      updatedData.image_url = req.file.path
        .replace(/\\/g, "/")
        .replace(/^public[\\/]+/, "");
    } else if (remove_image === "true") {
      // Explicitly remove image if frontend requested
      const oldImagePath = subSubMenu.image_url
        ? `public/${subSubMenu.image_url}`
        : null;
      if (oldImagePath && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      updatedData.image_url = null;
    }

    //  Save updates
    await subSubMenu.update(updatedData, { transaction });
    await transaction.commit();

    await log({
      req,
      action: "UPDATE",
      page_name: "UPDATE SUB-SUBMENU",
      target: subSubMenu.en_title,
    });

    res.status(200).json({
      message: "Sub-SubMenu updated successfully!",
      data: subSubMenu,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error("Error updating sub-submenu:", error);

    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({ message: "Validation error", errors });
    }

    res.status(500).json({
      message: "Failed to update sub-submenu. Please try again later.",
      error: error.message,
    });
  }
};

export const updateSubSubMenuStatus = async (req, res) => {
  let transaction;
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate the incoming status
    if (status !== 'Active' && status !== 'Inactive') {
      return res.status(400).json({ message: "Invalid status. Status must be either 'Active' or 'Inactive'." });
    }

    transaction = await sequelize.transaction();
    
    const subSubMenu = await SubSubMenu.findByPk(id, { transaction });
    if (!subSubMenu) {
      await transaction.rollback();
      return res.status(404).json({ message: "Sub-SubMenu not found." });
    }

    await subSubMenu.update({ status }, { transaction });
    await transaction.commit();
    
    res.status(200).json({ message: "Sub-SubMenu status updated successfully.", data: subSubMenu });

  } catch (error) {
    if (transaction) await transaction.rollback();
    
    console.error("Error updating sub-submenu status:", error);
    res.status(500).json({ message: "Failed to update sub-submenu status. Please try again later.", error: error.message });
  }
};

