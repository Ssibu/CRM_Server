
import Footerlink from '../../models/FooterLink.js';
import { Op } from 'sequelize';
import { log } from '../../services/LogService.js';
const PAGE_NAME = 'FOOTER_LINK';

// Helper: Validate URL format
const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
// Validation function
const validateFooterLink = (data) => {
  const errors = {};
  const en_link_text = data.en_link_text?.trim();
  const od_link_text = data.od_link_text?.trim();
  const url = data.url?.trim();

  if (!en_link_text) errors.en_link_text = "English link text is required.";
  else if (en_link_text.length > 50) errors.en_link_text = "English link text must not exceed 50 characters.";

  if (!od_link_text) errors.od_link_text = "Odia link text is required.";
  else if (od_link_text.length > 50) errors.od_link_text = "Odia link text must not exceed 50 characters.";

  if (!url) errors.url = "URL is required.";
  else if (!isValidURL(url)) errors.url = "URL is invalid.";

  return { isValid: Object.keys(errors).length === 0, errors };
};

// CREATE
export const create = async (req, res) => {
  try {
    const { en_link_text, od_link_text, url, linkType } = req.body;

    // Validate fields
    const validation = validateFooterLink({ en_link_text, od_link_text, url });
    if (!validation.isValid) {
      return res.status(400).send({ message: "Validation failed", errors: validation.errors });
    }

    // Check duplicates
    const existingLink = await Footerlink.findOne({
      where: {
        [Op.or]: [
          { en_link_text: en_link_text.trim() },
          { od_link_text: od_link_text.trim() },
          { url: url.trim() }
        ]
      }
    });
    if (existingLink) {
      return res.status(409).send({ message: "A footer link with this text or URL already exists." });
    }

    const newLink = await Footerlink.create({ en_link_text, od_link_text, url, linkType });
    await log({ req, action: 'CREATE', page_name: PAGE_NAME, target: newLink.id });
    res.status(201).send(newLink);

  } catch (error) {
    res.status(500).send({ message: error.message || "Error creating footer link." });
  }
};

// UPDATE
export const update = async (req, res) => {
  const { id } = req.params;
  const { en_link_text, od_link_text, url, linkType } = req.body;

  try {
    // Validate fields
    const validation = validateFooterLink({ en_link_text, od_link_text, url });
    if (!validation.isValid) {
      return res.status(400).send({ message: "Validation failed", errors: validation.errors });
    }

    // Check duplicates on other records
    const existingLink = await Footerlink.findOne({
      where: {
        [Op.or]: [
          { en_link_text: en_link_text.trim() },
          { od_link_text: od_link_text.trim() },
          { url: url.trim() }
        ],
        id: { [Op.ne]: id }
      }
    });
    if (existingLink) {
      return res.status(409).send({ message: "Another footer link with this text or URL already exists." });
    }

    const [updated] = await Footerlink.update({ en_link_text, od_link_text, url, linkType }, { where: { id } });
    if (!updated) return res.status(404).send({ message: `Cannot find link with id=${id}.` });

    const updatedLink = await Footerlink.findByPk(id);
    await log({ req, action: 'UPDATE', page_name: PAGE_NAME, target: id });
    res.status(200).send(updatedLink);

  } catch (error) {
    res.status(500).send({ message: error.message || `Error updating link with id=${id}.` });
  }
};
export const findAll = async (req, res) => {
  try {
    // Get query params from the hook, with defaults
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    let sortBy = req.query.sort || 'displayOrder';
    const sortOrder = req.query.order || 'ASC';

    // Security: Whitelist sortable columns
    const allowedSortColumns = ['id', 'en_link_text', 'od_link_text', 'linkType', 'status', 'createdAt', 'displayOrder'];
    if (!allowedSortColumns.includes(sortBy)) {
      sortBy = 'displayOrder'; // Fallback to a safe default
    }

    const offset = (page - 1) * limit;

    // Build the search clause
    const whereClause = search ? {
      // is_delete: false, // Add this if your model has a soft delete flag
      [Op.or]: [
        { en_link_text: { [Op.like]: `%${search}%` } },
        { od_link_text: { [Op.like]: `%${search}%` } },
        { linkType: { [Op.like]: `%${search}%` } },
      ],
    } : { /* is_delete: false */ };

    // Use findAndCountAll to get both the data rows and the total count
    const { count, rows } = await Footerlink.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limit,
      offset: offset,
    });

    await log({
      req,
      action: 'READ',
      page_name: PAGE_NAME,
    });

    // Return the data in the format the frontend hook expects
    return res.json({
      total: count,
      data: rows,
    });

  } catch (error) {
    console.error("Server Error in findAll Footerlinks:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
export const findOne = async (req, res) => {
  const { id } = req.params;
  try {
    const link = await Footerlink.findByPk(id);
    if (link) {
      await log({
        req,
        action: 'READ',
        page_name: PAGE_NAME,
        target: id, // Log which link was viewed
      });
      res.status(200).send(link);
    } else {
      res.status(404).send({ message: `Cannot find Link with id=${id}.` });
    }
  } catch (error) {
    res.status(500).send({ message: `Error retrieving Link with id=${id}.` });
  }
};

export const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Footerlink.destroy({ where: { id: id } });
    if (deleted) {
      await log({
        req,
        action: 'DELETE',
        page_name: PAGE_NAME,
        target: id, // Log which link was deleted
      });
      res.status(200).send({ message: "Link was deleted successfully!" });
    } else {
      res.status(404).send({ message: `Cannot find link with id=${id}.` });
    }
  } catch (error) {
    res.status(500).send({ message: `Could not delete link with id=${id}.` });
  }
};
export const updateOrder = async (req, res) => {
    const { order } = req.body;
    if (!Array.isArray(order)) {
        return res.status(400).send({ message: "Invalid 'order' data. Must be an array of IDs." });
    }
    try {
        const transaction = await Footerlink.sequelize.transaction();
        await Promise.all(order.map((id, index) =>
            Footerlink.update(
                { displayOrder: index },
                { where: { id: id }, transaction }
            )
        ));
        await transaction.commit();
        await log({
          req,
          action: 'UPDATE',
          page_name: PAGE_NAME,
          target: 'Reordered links',
        });
        res.status(200).send({ message: "Link order updated successfully." });
    } catch (error) {
        res.status(500).send({ message: "Failed to update link order.", error: error.message });
    }
};
export const toggleStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const link = await Footerlink.findByPk(id);
    if (!link) {
      return res.status(404).send({ message: `Cannot find Link with id=${id}.` });
    }
    const newStatus = link.status === 'Active' ? 'Inactive' : 'Active';
    await link.update({ status: newStatus });
     await log({
      req,
      action: 'UPDATE',
      page_name: PAGE_NAME,
      target: id, // Log which link had its status toggled
    });
    res.status(200).send({ message: `Status updated to ${newStatus} successfully.` });

  } catch (error) {
    res.status(500).send({ message: `Error toggling status for Link with id=${id}.` });
  }
};