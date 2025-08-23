import Page from "../models/Page.js";

export const createPage = async (req, res) => {
  try {
    const { pageName, shortCode, remarks } = req.body;

    if (!pageName || !shortCode) {
      return res.status(400).json({ message: "Page Name and Short Code are required" });
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

export const getPages = async (req, res) => {
  try {
    const pages = await Page.findAll({ order: [["createdAt", "DESC"]] });
    return res.json(pages);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
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

export const deletePage = async (req, res) => {
  try {
    const { id } = req.params;

    const page = await Page.findByPk(id);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    await page.destroy();

    return res.status(200).json({ message: "Page deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};