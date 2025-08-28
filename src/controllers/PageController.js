import Page from "../models/Page.js";
import {Op} from "sequelize"


export const createPage = async (req, res) => {
  try {
    const { pageName, shortCode, remarks } = req.body;

    if (!pageName || !shortCode) {
      return res.status(400).json({ message: "Page Name and Short Code are required" });
    }

    const existingPageName = await Page.findOne({ where: { pageName } });
    if (existingPageName) {
      return res.status(400).json({ message: "Page already exists." });
    }

    const existingShortCode = await Page.findOne({ where: { shortCode } });
    if (existingShortCode) {
      return res.status(400).json({ message: "Short Code already exists." });
    }

    const newPage = await Page.create({
      pageName,
      shortCode,
      remarks,
    });

    return res.status(201).json({
      message: "Page created successfully",
      data: newPage,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// export const getPages = async (req, res) => {
//   try {
//     const pages = await Page.findAll({ order: [["createdAt", "DESC"]] });
//     return res.json(pages);
//   } catch (error) {
//     return res.status(500).json({ message: "Server error" });
//   }
// };

export const getPages = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    
    // 1. Get sorting parameters from query
    const sortBy = req.query.sort || "createdAt"; // Default sort column
    const sortOrder = req.query.order || "DESC";    // Default sort order

    // 2. Security: Whitelist allowed sortable columns to prevent arbitrary column sorting
    const allowedSortColumns = ["pageName", "shortCode", "remarks", "createdAt"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    const whereClause = search
      ? {
          [Op.or]: [
            { pageName: { [Op.like]: `%${search}%` } },
            { shortCode: { [Op.like]: `%${search}%` } },
            { remarks: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await Page.findAndCountAll({
      where: whereClause,
      // 3. Add the order property to the query
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limit,
      offset: offset,
    });

    return res.json({
      total: count,
      data: rows,
    });
    
  } catch (error) {
    console.error("Server Error in getPages:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const getPageById = async (req, res) => {
  try {
    const { id } = req.params;

    const page = await Page.findByPk(id);

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    return res.status(200).json(page);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const togglePageStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const page = await Page.findByPk(id);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    page.isActive = !page.isActive;
    await page.save();

    return res.status(200).json({
      message: `Page has been ${page.isActive ? "activated" : "deactivated"} successfully`,
      data: page,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { pageName, shortCode, remarks, isActive } = req.body;

    const page = await Page.findByPk(id);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    if (pageName && pageName !== page.pageName) {
      const existingPageName = await Page.findOne({ where: { pageName } });
      if (existingPageName) {
        return res.status(400).json({ message: "Page Name already exists." });
      }
    }

    if (shortCode && shortCode !== page.shortCode) {
      const existingShortCode = await Page.findOne({ where: { shortCode } });
      if (existingShortCode) {
        return res.status(400).json({ message: "Short Code already exists." });
      }
    }

    page.pageName = pageName !== undefined ? pageName : page.pageName;
    page.shortCode = shortCode !== undefined ? shortCode : page.shortCode;
    page.remarks = remarks !== undefined ? remarks : page.remarks;
    page.isActive = isActive !== undefined ? isActive : page.isActive;

    await page.save();

    return res.status(200).json({
      message: "Page updated successfully",
      data: page,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

