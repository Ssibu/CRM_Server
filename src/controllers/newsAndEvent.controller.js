import NewsAndEvent from '../models/newsAndEvent.model.js';
import fs from 'fs';
import path from 'path';
export const create = async (req, res) => {
  try {
    const { titleEnglish, titleOdia, eventDate } = req.body;
    
    if (!req.file) {
      return res.status(400).send({ message: "A document or image file is required." });
    }
    if (!titleEnglish || !titleOdia || !eventDate) {
        return res.status(400).send({ message: "Title and Event Date are required." });
    }

    const newEvent = await NewsAndEvent.create({
      titleEnglish,
      titleOdia,
      eventDate,
      document: req.file.filename
    });
    res.status(201).send(newEvent);
  } catch (error) {
    res.status(500).send({ message: error.message || "Error creating News & Event." });
  }
};
export const findAll = async (req, res) => {
  try {
    const events = await NewsAndEvent.findAll({ order: [['displayOrder', 'ASC']] });
    res.status(200).send(events);
  } catch (error) {
    res.status(500).send({ message: error.message || "Error retrieving News & Events." });
  }
};
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
export const update = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await NewsAndEvent.findByPk(id);
    if (!event) {
      return res.status(404).send({ message: "Event not found." });
    }
    const updatedData = {
      ...req.body,
      document: req.file ? req.file.filename : event.document
    };
    if (req.file && event.document) {
        const oldFilePath = path.join('public/uploads/', event.document);
        if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
        }
    }
    
    await NewsAndEvent.update(updatedData, { where: { id: id } });
    res.status(200).send({ message: "Event was updated successfully." });

  } catch (error) {
    res.status(500).send({ message: `Error updating Event with id=${id}.` });
  }
};
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