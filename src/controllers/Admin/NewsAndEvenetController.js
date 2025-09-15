import NewsAndEvent from '../../models/NewsAndEvent.js';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import { log } from '../../services/LogService.js';
import { reformatDate } from '../../utils/reformat-date.js';

const PAGE_NAME = 'NEWS AND EVENT';
// Validation function
export const validateNewsEvent = (data, isUpdate = false) => {
  const errors = {};

  const en_title = data.en_title?.trim();
  const od_title = data.od_title?.trim();
  const eventDate = data.eventDate;
  const document = data.document;

  if (!en_title) errors.en_title = "English Title is required.";
  else if (en_title.length > 100) errors.en_title = "English Title must not exceed 100 characters.";

  if (!od_title) errors.od_title = "Odia Title is required.";
  else if (od_title.length > 100) errors.od_title = "Odia Title must not exceed 100  characters.";

  if (!eventDate) errors.eventDate = "Event Date is required.";

  if (!isUpdate && !document) errors.document = "A document or image file is required.";

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};


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

// CREATE News & Event
export const create = async (req, res) => {
  try {
    let { en_title, od_title, eventDate } = req.body;
    const document = req.file ? path.basename(req.file.path) : null;

    // Normalize
    en_title = normalizeTitle(en_title);
    od_title = normalizeTitle(od_title);

    // Validate
    const validation = validateNewsEvent({ en_title, od_title, eventDate, document }, false);
    if (!validation.isValid) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Validation failed", errors: validation.errors });
    }

    // Check duplicates (ignoring extra spaces)
    const existingEvent = await NewsAndEvent.findOne({
      where: {
        [Op.or]: [
          { en_title },
          { od_title },
          { document }
        ]
      }
    });
    if (existingEvent) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(409).json({ message: "An event with this English Title, Odia Title, or Document already exists." });
    }

    const newEvent = await NewsAndEvent.create({ en_title, od_title, eventDate, document });
    await log({ req, action: 'CREATE', page_name: PAGE_NAME, target: newEvent.id });

    res.status(201).json({ message: "News & Event created successfully!", data: newEvent });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server error while creating event." });
  }
};




// UPDATE News & Event
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await NewsAndEvent.findByPk(id);
    if (!event) return res.status(404).json({ message: "Event not found." });

    let { en_title, od_title, eventDate, status, removeExistingDocument } = req.body;
    const shouldRemoveDocument = removeExistingDocument === 'true';
    const newDocument = req.file ? path.basename(req.file.path) : (shouldRemoveDocument ? null : event.document);

    // Normalize
    en_title = normalizeTitle(en_title);
    od_title = normalizeTitle(od_title);

    // Validate
    const validation = validateNewsEvent({ en_title, od_title, eventDate, document: newDocument }, true);
    if (!validation.isValid) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Validation failed", errors: validation.errors });
    }

    // Check duplicates only if changing
    const potentialDuplicates = [];
    if (en_title && en_title !== event.en_title) potentialDuplicates.push({ en_title });
    if (od_title && od_title !== event.od_title) potentialDuplicates.push({ od_title });
    if (newDocument && newDocument !== event.document) potentialDuplicates.push({ document: newDocument });

    if (potentialDuplicates.length > 0) {
      const existingEvent = await NewsAndEvent.findOne({
        where: { [Op.or]: potentialDuplicates, id: { [Op.ne]: id } }
      });
      if (existingEvent) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(409).json({ message: "Another event with this Title or Document already exists." });
      }
    }

    // Delete old file if needed
    if ((req.file || shouldRemoveDocument) && event.document) deleteFile(event.document, 'events');

    // Update record
    await event.update({
      en_title: en_title || event.en_title,
      od_title: od_title || event.od_title,
      eventDate: eventDate || event.eventDate,
      status: status !== undefined ? status : event.status,
      document: newDocument,
    });

    await log({ req, action: 'UPDATE', page_name: PAGE_NAME, target: id });
    res.status(200).json({ message: "Event updated successfully!", data: event });

  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Server error while updating event." });
  }
};







// No changes needed for findAll
export const findAll = async (req, res) => {
  try {
    // Get query params from the hook, with defaults
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = (req.query.search || '').trim();
    let sortBy = req.query.sort || 'displayOrder';
    const sortOrder = req.query.order || 'ASC';

    // Security: Whitelist sortable columns
    const allowedSortColumns = ['id', 'en_title', 'od_title', 'eventDate', 'status', 'createdAt', 'displayOrder'];
    if (!allowedSortColumns.includes(sortBy)) {
      sortBy = 'displayOrder'; // Fallback to a safe default
    }

    const offset = (page - 1) * limit;

    const formatDate = reformatDate(search)

    // Build the search clause
    const whereClause = search ? {
      [Op.or]: [
        { en_title: { [Op.like]: `%${search}%` } },
        { od_title: { [Op.like]: `%${search}%` } },
        { eventDate: { [Op.like]: `%${formatDate}%` } },
      ],
    } : {};

    // Use findAndCountAll to get both the data rows and the total count
    const { count, rows } = await NewsAndEvent.findAndCountAll({
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
    await log({
      req,
      action: 'DELETE',
      page_name: PAGE_NAME,
      target: id, // Log which event was deleted
    });
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
      await log({
        req,
        action: 'READ',
        page_name: PAGE_NAME,
        target: id, // Log which event was viewed
      });
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
     await log({
      req,
      action: 'UPDATE',
      page_name: PAGE_NAME,
      target: id, // Log which event had its status toggled
    });
    res.status(200).send({ message: `Status updated to ${newStatus} successfully.` });

  } catch (error) {
    res.status(500).send({ message: `Error toggling status for Event with id=${id}.` });
  }
};

