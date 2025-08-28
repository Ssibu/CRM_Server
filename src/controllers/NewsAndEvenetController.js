import NewsAndEvent from '../models/NewsAndEvent.js';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';

// CORRECTED: create function is now simpler
export const create = async (req, res) => {
  try {
    const { titleEnglish, titleOdia, eventDate } = req.body;
    
    // No need to check for req.file here, the middleware will have already processed it.
    // The file path is now available at req.file.path
    
    if (!titleEnglish || !titleOdia || !eventDate) {
        return res.status(400).send({ message: "Title and Event Date are required." });
    }

    const newEvent = await NewsAndEvent.create({
      titleEnglish,
      titleOdia,
      eventDate,
      // Use the path provided by the new middleware
      document: req.file.path 
    });
    res.status(201).send(newEvent);
  } catch (error) {
    res.status(500).send({ message: error.message || "Error creating News & Event." });
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
export const update = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await NewsAndEvent.findByPk(id);
    if (!event) {
      return res.status(404).send({ message: "Event not found." });
    }

    // The middleware already handled deleting the old file if a new one was provided.
    // We just need to construct the data to update.
    const updatedData = {
      ...req.body,
      // If a new file was uploaded, req.file will exist. Use its path.
      // If not, req.file will be undefined, and we don't update the document field,
      // letting the old value remain in the database.
      ...(req.file && { document: req.file.path })
    };
    
    await NewsAndEvent.update(updatedData, { where: { id: id } });
    const updatedEvent = await NewsAndEvent.findByPk(id);
    res.status(200).send(updatedEvent);

  } catch (error) {
    res.status(500).send({ message: `Error updating Event with id=${id}.` });
  }
};

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