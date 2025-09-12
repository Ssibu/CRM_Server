import { Op } from 'sequelize';
import ActAndRule from '../../models/ActAndRules.js';
import { log } from '../../services/LogService.js';
import { reformatDate } from '../../utils/reformat-date.js';

const PAGE_NAME = 'ACT AND RULE';



export const create = async (req, res) => {
  try {
    const { en_title, od_title, en_description, od_description, date } = req.body;

    // --- 1. VALIDATION: Check for duplicates ---
    const existingRecord = await ActAndRule.findOne({
      where: {
        [Op.or]: [
          { en_title: en_title },
          { od_title: od_title }
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
        en_title,
        od_title,
        en_description,
        od_description,
        date
    });
    await log({
      req,
      action: 'CREATE',
      page_name: PAGE_NAME,
      target: newActAndRule.id, // Log the ID of the new record
    });

    res.status(201).send(newActAndRule);
  } catch (error) {
    // This will catch other errors, like database connection issues
    res.status(500).send({ message: error.message || "Error creating Act & Rule." });
  }
};


// export const findAll = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 10;
//     const search = (req.query.search || '').trim();
    
//     let sortBy = req.query.sort || 'createdAt';
//     const sortOrder = req.query.order || 'ASC';

//     const allowedSortColumns = ['id', 'en_title', 'od_title', 'status', 'createdAt', 'displayOrder','date'];
//     if (!allowedSortColumns.includes(sortBy)) {
//       sortBy = 'displayOrder';
//     }

//     const offset = (page - 1) * limit;

//      const formattedSearch = reformatDate(search) || search;

//     const whereClause = search ? {
 
//       [Op.or]: [
//         { en_title: { [Op.like]: `%${search}%` } },
//         { od_title: { [Op.like]: `%${search}%` } },
//         { date: { [Op.like]: `%${formattedSearch}%` } },
//       ],
//     } : { /* is_delete: false */ };

//     const { count, rows } = await ActAndRule.findAndCountAll({
//       where: whereClause,
//       order: [[sortBy, sortOrder.toUpperCase()]],
//       limit: limit,
//       offset: offset,
//     });
//     await log({
//       req,
//       action: 'READ',
//       page_name: PAGE_NAME,
//     });

//     return res.json({
//       total: count,
//       data: rows,
//     });

//   } catch (error) {
//     console.error("Server Error in findAll ActAndRules:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

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

export const update = async (req, res) => {
  const { id } = req.params;
  const { en_title, od_title } = req.body;

  try {
    // --- 1. VALIDATION: Check for duplicates on other records ---
    if (en_title || od_title) { // Only check if a title is being updated
      const existingRecord = await ActAndRule.findOne({
        where: {
          [Op.or]: [
            { en_title: en_title || '' },
            { od_title: od_title || '' }
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
     await log({
      req,
      action: 'UPDATE',
      page_name: PAGE_NAME,
      target: id, // Log which record was updated
    });
    
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