import GeneratedLink from '../models/GeneratedLink.js';
import path from "path";
import fs from "fs";

const UPLOAD_DIRECTORY = 'public/uploads/generated-links';

const deleteFile = (filename) => {
    if (filename) {
        const filePath = path.join(UPLOAD_DIRECTORY, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

export const createLink = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });
    if (!req.file) return res.status(400).json({ message: "A file is required" });

    const fileName = path.basename(req.file.path);
    const newLink = await GeneratedLink.create({ title, filePath: fileName });

    res.status(201).json(newLink);
  } catch (err) {
    console.error("Error creating link:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLinks = async (req, res) => {
  try {
    const links = await GeneratedLink.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json(links);
  } catch (err) {
    console.error("Error fetching links:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLinkById = async (req, res) => {
  try {
    const link = await GeneratedLink.findByPk(req.params.id);
    if (!link) return res.status(404).json({ message: "Link not found" });
    res.status(200).json(link);
  } catch (err) {
    console.error("Error fetching link by ID:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateLink = async (req, res) => {
  try {
    const link = await GeneratedLink.findByPk(req.params.id);
    if (!link) return res.status(404).json({ message: "Link not found" });

    const { title } = req.body;
    link.title = title || link.title;

    if (req.file) {
      deleteFile(link.filePath); // Delete the old file
      link.filePath = path.basename(req.file.path); // Set the new filename
    }

    await link.save();
    res.status(200).json(link);
  } catch (err) {
    console.error("Error updating link:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteLink = async (req, res) => {
  try {
    const link = await GeneratedLink.findByPk(req.params.id);
    if (!link) return res.status(404).json({ message: "Link not found" });

    deleteFile(link.filePath); // Delete the associated file from the server
    await link.destroy();     // Delete the record from the database

    res.status(200).json({ message: "Link deleted successfully" });
  } catch (err) {
    console.error("Error deleting link:", err);
    res.status(500).json({ message: "Server error" });
  }
};