import models from "../models/index.js"
import {Op} from "sequelize"

const { User, Page, sequelize } = models;

export const getPermissionUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { isAdmin: false },
      attributes: ['id', 'name', 'email'],
    });
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching permission users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// NEW: A dedicated, paginated endpoint for pages
export const getPermissionPages = async (req, res) => {
  try {
    // 1. Get query parameters for pagination, search, and sort
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "pageName"; // Default sort
    const sortOrder = req.query.order || "ASC";

    // Whitelist allowed sortable columns
    const allowedSortColumns = ["pageName", "shortCode"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    // Build search clause
    const whereClause = {
      isActive: true, // Always get active pages
      ...(search && { // Spread search conditions if search term exists
        [Op.or]: [
          { pageName: { [Op.like]: `%${search}%` } },
          { shortCode: { [Op.like]: `%${search}%` } },
        ],
      })
    };

    // Use findAndCountAll for pagination
    const { count, rows } = await Page.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limit,
      offset: offset,
      attributes: ['id', 'pageName', 'shortCode'],
    });

    // Return data in the format our hook expects
    res.status(200).json({
      total: count,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching paginated pages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const getPermissionData = async (req, res) => {
  try {
    const [users, pages] = await Promise.all([
      User.findAll({
        where: { isAdmin: false }, 
        attributes: ['id', 'name', 'email'], 
      }),
      Page.findAll({
           where: { isActive: true }, 
        attributes: ['id', 'pageName', 'shortCode', 'remarks'],
      }),
    ]);

    res.status(200).json({ users, pages });
  } catch (error) {
    console.error("Error fetching permission data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getUserPermissions = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

   
    const pages = await user.getPages({ attributes: ['id'], joinTableAttributes: [] });
    const pageIds = pages.map(p => p.id);

    res.status(200).json({ pageIds });
  } catch (error) {
    console.error(`Error fetching permissions for user ${userId}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const assignPermissions = async (req, res) => {
  const { userId, pageIds } = req.body;

  if (!userId || !Array.isArray(pageIds)) {
    return res.status(400).json({ message: "Invalid request: userId and a pageIds array are required." });
  }

  const t = await sequelize.transaction(); 

  try {
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: "User not found." });
    }


    await user.setPages(pageIds, { transaction: t });

    await t.commit();

    res.status(200).json({ message: "Permissions assigned successfully." });
  } catch (error) {
    await t.rollback();
    console.error("Error assigning permissions:", error);
    res.status(500).json({ message: "Failed to assign permissions." });
  }
};