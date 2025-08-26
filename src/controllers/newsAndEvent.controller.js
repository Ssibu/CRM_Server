import NewsAndEvent from '../models/newsAndEvent.model.js';
import fs from 'fs';
import path from 'path';

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
    const events = await NewsAndEvent.findAll({ order: [['displayOrder', 'ASC']] });
    res.status(200).send(events);
  } catch (error) {
    res.status(500).send({ message: error.message || "Error retrieving News & Events." });
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