import { Op } from 'sequelize';
import ActAndRule from '../models/ActAndRules.js';
export const create = async (req, res) => {
  try {
    const { titleEnglish, titleOdia, descriptionEnglish, descriptionOdia } = req.body;

    // --- 1. VALIDATION: Check for duplicates ---
    const existingRecord = await ActAndRule.findOne({
      where: {
        [Op.or]: [
          { titleEnglish: titleEnglish },
          { titleOdia: titleOdia }
        ]
      }
    });

    if (existingRecord) {
      // Use status 409 Conflict for duplicate data errors
      return res.status(409).send({ message: "An Act or Rule with this English or Odia title already exists." });
    }
    // --- END VALIDATION ---
    
    // If no duplicate is found, proceed to create the new record
    const newActAndRule = await ActAndRule.create({
        titleEnglish,
        titleOdia,
        descriptionEnglish,
        descriptionOdia
    });

    res.status(201).send(newActAndRule);
  } catch (error) {
    // This will catch other errors, like database connection issues
    res.status(500).send({ message: error.message || "Error creating Act & Rule." });
  }
};
export const findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    
    // --- CORRECTED: Use 'let' for variables that might be reassigned ---
    let sortBy = req.query.sort || 'displayOrder';
    const sortOrder = req.query.order || 'ASC';

    // Security: Whitelist sortable columns to prevent unwanted sorting
    const allowedSortColumns = ['id', 'titleEnglish', 'titleOdia', 'status', 'createdAt', 'displayOrder'];
    if (!allowedSortColumns.includes(sortBy)) {
      // This reassignment is now valid because sortBy was declared with 'let'
      sortBy = 'displayOrder';
    }

    const offset = (page - 1) * limit;

    const whereClause = search ? {
      // Assuming your model does not use a soft delete flag.
      // If it does, add `is_delete: false` here.
      [Op.or]: [
        { titleEnglish: { [Op.like]: `%${search}%` } },
        { titleOdia: { [Op.like]: `%${search}%` } },
      ],
    } : { /* is_delete: false */ };

    const { count, rows } = await ActAndRule.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limit,
      offset: offset,
    });

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
      res.status(200).send(actAndRule);
    } else {
      res.status(404).send({ message: `Cannot find Act & Rule with id=${id}.` });
    }
  } catch (error) {
    res.status(500).send({ message: `Error retrieving Act & Rule with id=${id}.` });
  }
};
export const update = async (req, res) => {
  const { id } = req.params;
  const { titleEnglish, titleOdia } = req.body;

  try {
    // --- 1. VALIDATION: Check for duplicates on other records ---
    if (titleEnglish || titleOdia) { // Only check if a title is being updated
      const existingRecord = await ActAndRule.findOne({
        where: {
          [Op.or]: [
            { titleEnglish: titleEnglish || '' },
            { titleOdia: titleOdia || '' }
          ],
          id: {
            [Op.ne]: id // Crucial: Exclude the current record (ne = Not Equal)
          }
        }
      });

      if (existingRecord) {
        // A different record with this title already exists.
        return res.status(409).send({ message: "Another Act or Rule with this title already exists." });
      }
    }
    // --- END VALIDATION ---

    // Find the record to update
    const actAndRule = await ActAndRule.findByPk(id);
    if (!actAndRule) {
      return res.status(404).send({ message: `Cannot find Act & Rule with id=${id}.` });
    }

    // If validation passes, proceed to update
    await actAndRule.update(req.body);
    
    res.status(200).send(actAndRule);

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).send({ message: 'This title already exists.' });
    }
    res.status(500).send({ message: `Error updating Act & Rule with id=${id}.` });
  }
};
export const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await ActAndRule.destroy({ where: { id: id } });
    if (deleted) {
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
    
    res.status(200).send({ message: `Status updated to ${newStatus} successfully.` });

  } catch (error) {
    res.status(500).send({ message: `Error toggling status for Act & Rule with id=${id}.` });
  }
};