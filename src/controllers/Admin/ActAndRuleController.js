import { Op } from 'sequelize';
import ActAndRule from '../../models/ActAndRules.js';
import { log } from '../../services/LogService.js';
import { reformatDate } from '../../utils/reformat-date.js';

const PAGE_NAME = 'ACT AND RULE';

// Validation function
const validateActAndRule = (data, isUpdate = false) => {
  const errors = {};
  const en_title = data.en_title?.trim();
  const od_title = data.od_title?.trim();
  const en_description = data.en_description?.trim();
  const od_description = data.od_description?.trim();

  if (!en_title) errors.en_title = "English Title is required.";
  else if (en_title.length > 100) errors.en_title = "English Title must not exceed 100 characters.";

  if (!od_title) errors.od_title = "Odia Title is required.";
  else if (od_title.length > 100) errors.od_title = "Odia Title must not exceed 100 characters.";

  if (!en_description) errors.en_description = "English Description is required.";
  if (!od_description) errors.od_description = "Odia Description is required.";

  return { isValid: Object.keys(errors).length === 0, errors };
};

// CREATE
export const create = async (req, res) => {
  try {
    const { en_title, od_title, en_description, od_description, date } = req.body;

    // Validate
    const validation = validateActAndRule({ en_title, od_title, en_description, od_description }, false);
    if (!validation.isValid) {
      return res.status(400).send({ message: "Validation failed", errors: validation.errors });
    }

    // Check duplicates ignoring spaces
    const normalizedEnTitle = en_title.trim().replace(/\s+/g, " ");
    const normalizedOdTitle = od_title.trim().replace(/\s+/g, " ");
    const existingRecord = await ActAndRule.findOne({
      where: {
        [Op.or]: [
          { en_title: normalizedEnTitle },
          { od_title: normalizedOdTitle }
        ]
      }
    });

    if (existingRecord) {
      return res.status(409).send({ message: "An Act or Rule with this English or Odia title already exists." });
    }

    const newActAndRule = await ActAndRule.create({
      en_title: normalizedEnTitle,
      od_title: normalizedOdTitle,
      en_description,
      od_description,
      date
    });

    await log({ req, action: 'CREATE', page_name: PAGE_NAME, target: newActAndRule.id });
    res.status(201).send(newActAndRule);

  } catch (error) {
    res.status(500).send({ message: error.message || "Error creating Act & Rule." });
  }
};
//UPDATE
export const update = async (req, res) => {
  const { id } = req.params;
  try {
    const actAndRule = await ActAndRule.findByPk(id);
    if (!actAndRule) return res.status(404).send({ message: `Cannot find Act & Rule with id=${id}.` });

    const { en_title, od_title, en_description, od_description, date } = req.body;

    // Validate
    const validation = validateActAndRule({ en_title, od_title, en_description, od_description }, true);
    if (!validation.isValid) {
      return res.status(400).send({ message: "Validation failed", errors: validation.errors });
    }

    // Check duplicates on other records
    if (en_title || od_title) {
      const normalizedEnTitle = en_title.trim().replace(/\s+/g, " ");
      const normalizedOdTitle = od_title.trim().replace(/\s+/g, " ");
      const existingRecord = await ActAndRule.findOne({
        where: {
          [Op.or]: [
            { en_title: normalizedEnTitle },
            { od_title: normalizedOdTitle }
          ],
          id: { [Op.ne]: id }
        }
      });
      if (existingRecord) {
        return res.status(409).send({ message: "Another Act or Rule with this title already exists." });
      }
    }

    await actAndRule.update({ ...req.body });
    await log({ req, action: 'UPDATE', page_name: PAGE_NAME, target: id });
    res.status(200).send(actAndRule);

  } catch (error) {
    res.status(500).send({ message: `Error updating Act & Rule with id=${id}.` });
  }
};
export const findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    // The search term is already correctly trimmed here
    const search = (req.query.search || '').trim();
    
    let sortBy = req.query.sort || 'createdAt';
    const sortOrder = req.query.order || 'ASC';

    const allowedSortColumns = ['id', 'en_title', 'od_title', 'status', 'createdAt', 'displayOrder', 'date'];
    if (!allowedSortColumns.includes(sortBy)) {
      sortBy = 'displayOrder';
    }

    const offset = (page - 1) * limit;

    // --- ✅ Corrected Search Logic ---
    const whereClause = {}; // Start with an empty where clause
    const orClauses = [];   // An array to hold all possible search conditions

    // Only build search clauses if the user provided a search term
    if (search) {
      // 1. Always add [Op.like] conditions for string-based columns
      orClauses.push({ en_title: { [Op.like]: `%${search}%` } });
      orClauses.push({ od_title: { [Op.like]: `%${search}%` } });

      // 2. Try to format the search term as a date
      const formattedDate = reformatDate(search);
      console.log(formattedDate)
      
      // 3. If it's a valid date, add an EXACT match clause for the date column
      if (formattedDate) {
        // This is the key fix: No [Op.like], no '%' wildcards
        orClauses.push({ date: formattedDate });
      }
    }

    // 4. If any search conditions were added, attach them to the main where clause
    if (orClauses.length > 0) {
      whereClause[Op.or] = orClauses;
    }

    // If your model uses a soft-delete flag, you can add it here:
    // whereClause.is_delete = false;

    const { count, rows } = await ActAndRule.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limit,
      offset: offset,
    });

    if(!search  ){
      await log({
      req,
      action: 'READ',
      page_name: PAGE_NAME,
    });
    }

    return res.json({
      total: count,
      data: rows,
    });

  } catch (error) {
    console.error("Server Error in findAll ActAndRules:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const findOne = async (req, res) => {
  const { id } = req.params;
  try {
    const actAndRule = await ActAndRule.findByPk(id);
    if (actAndRule) {
       await log({
        req,
        action: 'READ',
        page_name: PAGE_NAME,
        target: id, // Log which specific record was read
      });
      res.status(200).send(actAndRule);
    } else {
      res.status(404).send({ message: `Cannot find Act & Rule with id=${id}.` });
    }
  } catch (error) {
    res.status(500).send({ message: `Error retrieving Act & Rule with id=${id}.` });
  }
};


export const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await ActAndRule.destroy({ where: { id: id } });
    if (deleted) {
       await log({
        req,
        action: 'DELETE',
        page_name: PAGE_NAME,
        target: id, // Log which record was deleted
      });
      res.status(200).send({ message: "Act & Rule was deleted successfully!" });
    } else {
      res.status(404).send({ message: `Cannot find Act & Rule with id=${id}.` });
    }
  } catch (error) {
    res.status(500).send({ message: `Could not delete Act & Rule with id=${id}.` });
  }
};
export const updateOrder = async (req, res) => {
    const { order } = req.body; 
    if (!Array.isArray(order)) {
        return res.status(400).send({ message: "Invalid 'order' data. Must be an array of IDs." });
    }
    try {
        const transaction = await ActAndRule.sequelize.transaction();
        await Promise.all(order.map((id, index) =>
            ActAndRule.update(
                { displayOrder: index },
                { where: { id: id }, transaction }
            )
        ));
        await transaction.commit();
        await log({
          req,
          action: 'UPDATE',
          page_name: PAGE_NAME,
          target: 'Reordered items', // A general target for this action is fine
        });
        res.status(200).send({ message: "Order updated successfully." });
    } catch (error) {
        res.status(500).send({ message: "Failed to update order.", error: error.message });
    }
};
export const toggleStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const actAndRule = await ActAndRule.findByPk(id);
    if (!actAndRule) {
      return res.status(404).send({ message: `Cannot find Act & Rule with id=${id}.` });
    }
    const newStatus = actAndRule.status === 'Active' ? 'Inactive' : 'Active';
    await actAndRule.update({ status: newStatus });

    await log({
      req,
      action: 'UPDATE',
      page_name: PAGE_NAME,
      target: id, // Log which record had its status toggled
    });
    
    res.status(200).send({ message: `Status updated to ${newStatus} successfully.` });

  } catch (error) {
    res.status(500).send({ message: `Error toggling status for Act & Rule with id=${id}.` });
  }
};