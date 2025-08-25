import NewsAndEvent from '../models/newsAndEvent.model.js';
import fs from 'fs';
import path from 'path';

// Create a new News & Event (Simplified)
export const create = async (req, res) => {
  try {
    // Description fields are no longer expected in the request body
    const { titleEnglish, titleOdia, eventDate } = req.body;
    
    if (!req.file) {
      return res.status(400).send({ message: "A document or image file is required." });
    }
    
    // Basic validation for the remaining fields
    if (!titleEnglish || !titleOdia || !eventDate) {
        return res.status(400).send({ message: "Title and Event Date are required." });
    }

    const newEvent = await NewsAndEvent.create({
      titleEnglish,
      titleOdia,
      eventDate,
      // description fields are removed
      document: req.file.filename
    });
    res.status(201).send(newEvent);
  } catch (error) {
    res.status(500).send({ message: error.message || "Error creating News & Event." });
  }
};

// Retrieve all News & Events (no changes needed here)
export const findAll = async (req, res) => {
  try {
    const events = await NewsAndEvent.findAll({ order: [['displayOrder', 'ASC']] });
    res.status(200).send(events);
  } catch (error) {
    res.status(500).send({ message: error.message || "Error retrieving News & Events." });
  }
};

// Delete a News & Event by ID (no changes needed here)
export const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await NewsAndEvent.findByPk(id);
    if (!event) {
      return res.status(404).send({ message: `Event not found.` });
    }

    if (event.document) {
      const filePath = path.join('public/uploads/', event.document);
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

// NOTE: Remember to add simplified 'update' and 'updateOrder' functions later.