import NewsAndEvent from '../models/NewsAndEvent.js';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';

// CORRECTED: create function is now simpler
export const create = async (req, res) => {
  try {
    const { titleEnglish, titleOdia, eventDate } = req.body;
    
    if (!req.file) return res.status(400).send({ message: "A document or image file is required." });
    if (!titleEnglish || !titleOdia || !eventDate) return res.status(400).send({ message: "Title and Event Date are required." });

    // Validation for titles AND the new document path
    const existingEvent = await NewsAndEvent.findOne({
      where: {
        [Op.or]: [
          { titleEnglish: titleEnglish },
          { titleOdia: titleOdia },
          { document: req.file.path } // Check if this document path already exists
        ]
      }
    });

    if (existingEvent) {
      // Check which field caused the conflict for a more specific message
      if (existingEvent.document === req.file.path) {
          // Note: Because of unique filenames, this is nearly impossible to hit, but it's good practice.
          return res.status(409).send({ message: "This exact document has already been uploaded." });
      }
      return res.status(409).send({ message: "An event with this English or Odia title already exists." });
    }
    
    const newEvent = await NewsAndEvent.create({ ...req.body, document: req.file.path });
    res.status(201).send(newEvent);
  } catch (error) {
    // The DB-level unique constraint is our final safety net
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).send({ message: 'This title or document already exists.' });
    }
    res.status(500).send({ message: error.message || "Error creating News & Event." });
  }
};


// --- CORRECTED `update` FUNCTION ---
export const update = async (req, res) => {
  const { id } = req.params;
  const { titleEnglish, titleOdia } = req.body;
  
  try {
    // Check for duplicate titles or document paths on OTHER records
    if (titleEnglish || titleOdia || req.file) {
      const potentialDuplicates = [];
      if (titleEnglish) potentialDuplicates.push({ titleEnglish });
      if (titleOdia) potentialDuplicates.push({ titleOdia });
      if (req.file) potentialDuplicates.push({ document: req.file.path });

      const existingEvent = await NewsAndEvent.findOne({
        where: {
          [Op.or]: potentialDuplicates,
          id: {
            [Op.ne]: id // Exclude the current record from the check
          }
        }
      });

      if (existingEvent) {
        if (existingEvent.document === req.file?.path) {
            return res.status(409).send({ message: "This exact document is already used by another record." });
        }
        return res.status(409).send({ message: "Another event with this title already exists." });
      }
    }

    const event = await NewsAndEvent.findByPk(id);
    if (!event) {
      return res.status(404).send({ message: "Event not found." });
    }

    const updatedData = {
      ...req.body,
      document: req.file ? req.file.path : event.document
    };
    
    // The upload middleware handles deleting the old file via 'oldFilePath'
    await event.update(updatedData);
    res.status(200).send(event);

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).send({ message: 'This title or document already exists.' });
    }
    res.status(500).send({ message: `Error updating Event with id=${id}.` });
  }
};

// No changes needed for findAll
export const findAll = async (req, res) => {
  try {
    // Get query params from the hook, with defaults
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    let sortBy = req.query.sort || 'displayOrder';
    const sortOrder = req.query.order || 'ASC';

    // Security: Whitelist sortable columns
    const allowedSortColumns = ['id', 'titleEnglish', 'titleOdia', 'eventDate', 'status', 'createdAt', 'displayOrder'];
    if (!allowedSortColumns.includes(sortBy)) {
      sortBy = 'displayOrder'; // Fallback to a safe default
    }

    const offset = (page - 1) * limit;

    // Build the search clause
    const whereClause = search ? {
      [Op.or]: [
        { titleEnglish: { [Op.like]: `%${search}%` } },
        { titleOdia: { [Op.like]: `%${search}%` } },
      ],
    } : {};

    // Use findAndCountAll to get both the data rows and the total count
    const { count, rows } = await NewsAndEvent.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limit,
      offset: offset,
    });

    // --- THIS IS THE CRITICAL FIX ---
    // Return the data in the object format that the frontend hook expects
    return res.json({
      total: count,
      data: rows,
    });

  } catch (error) {
    console.error("Server Error in findAll NewsAndEvents:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// CORRECTED: destroy function now uses the correct file path from the DB
export const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await NewsAndEvent.findByPk(id);
    if (!event) {
      return res.status(404).send({ message: `Event not found.` });
    }

    // The document path in the DB will be something like '/uploads/events/event-doc-123.jpeg'
    // We need to construct the full path relative to the 'public' directory.
    if (event.document) {
      // path.join combines paths, slice(1) removes the leading '/' from the stored path
      const filePath = path.join('public', event.document.slice(1));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await NewsAndEvent.destroy({ where: { id: id } });
    res.status(200).send({ message: "Event was deleted successfully!" });
  } catch (error) {
    res.status(500).send({ message: `Could not delete event.` });
  }
};

// No changes needed for findOne
export const findOne = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await NewsAndEvent.findByPk(id);
    if (event) {
      res.status(200).send(event);
    } else {
      res.status(404).send({ message: `Cannot find Event with id=${id}.` });
    }
  } catch (error) {
    res.status(500).send({ message: `Error retrieving Event with id=${id}.` });
  }
};

// CORRECTED: update function is now much simpler

// No changes needed for toggleStatus
export const toggleStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await NewsAndEvent.findByPk(id);
    if (!event) {
      return res.status(404).send({ message: `Cannot find Event with id=${id}.` });
    }
    const newStatus = event.status === 'Active' ? 'Inactive' : 'Active';
    await event.update({ status: newStatus });
    res.status(200).send({ message: `Status updated to ${newStatus} successfully.` });

  } catch (error) {
    res.status(500).send({ message: `Error toggling status for Event with id=${id}.` });
  }
};

// NOTE: You still need to add the 'updateOrder' function when you are ready.