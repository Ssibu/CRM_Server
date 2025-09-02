import NewsAndEvent from '../models/NewsAndEvent.js';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';

const normalizeTitle = (str) => {
  return str ? str.trim().replace(/\s+/g, " ") : str;
};
const deleteFile = (filename, directory) => {
    if (filename) {
        const fullPath = path.join('public', 'uploads', directory, filename);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }
};
// CORRECTED: create function is now simpler
export const create = async (req, res) => {
  try {
    let { titleEnglish, titleOdia, eventDate } = req.body;

    if (!req.file) return res.status(400).json({ message: "A document or image file is required." });
    if (!titleEnglish || !eventDate) return res.status(400).json({ message: "English title and event date are required." });

    titleEnglish = normalizeTitle(titleEnglish);
    titleOdia = normalizeTitle(titleOdia);
    const documentFilename = path.basename(req.file.path);

    // --- CORRECTED: Check for duplicates on ALL unique fields ---
    const existingEvent = await NewsAndEvent.findOne({
      where: {
        [Op.or]: [
          { titleEnglish: titleEnglish },
          { titleOdia: titleOdia },
          { document: documentFilename }
        ]
      }
    });
    if (existingEvent) {
      return res.status(409).json({ message: "An event with this English Title, Odia Title, or Document already exists." });
    }

    const newEvent = await NewsAndEvent.create({
      titleEnglish,
      titleOdia,
      eventDate,
      document: documentFilename,
    });

    res.status(201).json({ message: "News & Event created successfully!", data: newEvent });
  } catch (error) {
    console.error("Error creating event:", error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: "This title or document already exists." });
    }
    res.status(500).json({ message: "Server error while creating event." });
  }
};


// --- CORRECTED `update` FUNCTION ---
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await NewsAndEvent.findByPk(id);
    if (!event) return res.status(404).json({ message: "Event not found." });

    let { titleEnglish, titleOdia, eventDate, status } = req.body;
    titleEnglish = normalizeTitle(titleEnglish);
    titleOdia = normalizeTitle(titleOdia);
    const documentFilename = req.file ? path.basename(req.file.path) : event.document;

    // --- CORRECTED: Check for duplicates on OTHER records ---
    const potentialDuplicates = [];
    if (titleEnglish && titleEnglish !== event.titleEnglish) potentialDuplicates.push({ titleEnglish });
    if (titleOdia && titleOdia !== event.titleOdia) potentialDuplicates.push({ titleOdia });
    if (req.file && documentFilename !== event.document) potentialDuplicates.push({ document: documentFilename });

    if (potentialDuplicates.length > 0) {
        const existingEvent = await NewsAndEvent.findOne({
            where: {
                [Op.or]: potentialDuplicates,
                id: { [Op.ne]: id } // Exclude the current record
            }
        });
        if (existingEvent) {
            return res.status(409).json({ message: "Another event with this Title or Document already exists." });
        }
    }

    // Delete the old file only if a new one was successfully uploaded
    if (req.file) {
      deleteFile(event.document, 'events');
    }
    
    await event.update({
        titleEnglish: titleEnglish || event.titleEnglish,
        titleOdia: titleOdia || event.titleOdia,
        eventDate: eventDate || event.eventDate,
        status: status !== undefined ? status : event.status,
        document: documentFilename,
    });

    res.status(200).json({ message: "Event updated successfully!", data: event });
  } catch (error) {
    console.error("Error updating event:", error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: "This title or document already exists." });
    }
    res.status(500).json({ message: "Server error while updating event." });
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