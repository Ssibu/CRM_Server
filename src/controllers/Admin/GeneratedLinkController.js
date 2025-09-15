// import GeneratedLink from '../../models/GeneratedLink.js';
// import path from "path";
// import fs from "fs";

// const UPLOAD_DIRECTORY = 'public/uploads/generated-links';

// const deleteFile = (filename) => {
//     if (filename) {
//         const filePath = path.join(UPLOAD_DIRECTORY, filename);
//         if (fs.existsSync(filePath)) {
//             fs.unlinkSync(filePath);
//         }
//     }
// };

// export const createLink = async (req, res) => {
//   try {
//     const { title } = req.body;
//     if (!title) return res.status(400).json({ message: "Title is required" });
//     if (!req.file) return res.status(400).json({ message: "A file is required" });

//     const fileName = path.basename(req.file.path);
//     const newLink = await GeneratedLink.create({ title, filePath: fileName });

//     res.status(201).json(newLink);
//   } catch (err) {
//     console.error("Error creating link:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const getLinks = async (req, res) => {
//   try {
//     const links = await GeneratedLink.findAll({ order: [['createdAt', 'DESC']] });
//     res.status(200).json(links);
//   } catch (err) {
//     console.error("Error fetching links:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const getLinkById = async (req, res) => {
//   try {
//     const link = await GeneratedLink.findByPk(req.params.id);
//     if (!link) return res.status(404).json({ message: "Link not found" });
//     res.status(200).json(link);
//   } catch (err) {
//     console.error("Error fetching link by ID:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const updateLink = async (req, res) => {
//   try {
//     const link = await GeneratedLink.findByPk(req.params.id);
//     if (!link) return res.status(404).json({ message: "Link not found" });

//     const { title } = req.body;
//     link.title = title || link.title;

//     if (req.file) {
//       deleteFile(link.filePath); // Delete the old file
//       link.filePath = path.basename(req.file.path); // Set the new filename
//     }

//     await link.save();
//     res.status(200).json(link);
//   } catch (err) {
//     console.error("Error updating link:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const deleteLink = async (req, res) => {
//   try {
//     const link = await GeneratedLink.findByPk(req.params.id);
//     if (!link) return res.status(404).json({ message: "Link not found" });

//     deleteFile(link.filePath); // Delete the associated file from the server
//     await link.destroy();     // Delete the record from the database

//     res.status(200).json({ message: "Link deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting link:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


import GeneratedLink from '../../models/GeneratedLink.js';
import path from 'path';
import fs from 'fs';
import { log } from '../../services/LogService.js';

const UPLOAD_DIRECTORY = 'public/uploads/generated-links';

// Utility to delete a file
const deleteFile = (filename) => {
  if (filename) {
    const filePath = path.join(UPLOAD_DIRECTORY, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

// CREATE
export const createLink = async (req, res) => {
  try {
    let { title } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });
    if (!req.file) return res.status(400).json({ message: "A file is required" });

    let message = null;

    // Truncate title if longer than 100 characters
    if (title.length > 100) {
      title = title.substring(0, 100);
      message = "Title must be 100 characters";
    }

    const fileName = path.basename(req.file.path);
    const newLink = await GeneratedLink.create({ title, filePath: fileName });

    await log({
      req,
      action: "CREATE",
      target: newLink.title,
      page_name: "ADD GENERATED LINK",
    });

    res.status(201).json({ ...newLink.toJSON(), message });
  } catch (err) {
    console.error("Error creating link:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// READ ALL
export const getLinks = async (req, res) => {
  try {
    const links = await GeneratedLink.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json(links);
  } catch (err) {
    console.error("Error fetching links:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// READ BY ID
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

// UPDATE
export const updateLink = async (req, res) => {
  try {
    const link = await GeneratedLink.findByPk(req.params.id);
    if (!link) return res.status(404).json({ message: "Link not found" });

    const { title } = req.body;

    if (title) {
      // Truncate if necessary
      link.title = title.length > 100 ? title.substring(0, 100) : title;
    }

    if (req.file) {
      deleteFile(link.filePath); // Delete old file
      link.filePath = path.basename(req.file.path); // Save new file
    }

    await log({
      req,
      action: "UPDATE",
      target: link.title,
      page_name: "EDIT GENERATED LINK",
    });

    await link.save();

    res.status(200).json({
      message: "Link updated successfully",
      filePath: link.filePath,
    });
  } catch (err) {
    console.error("Error updating link:", err.message, err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE
export const deleteLink = async (req, res) => {
  try {
    const link = await GeneratedLink.findByPk(req.params.id);
    if (!link) return res.status(404).json({ message: "Link not found" });

    deleteFile(link.filePath); // Delete file from server
    await link.destroy();      // Delete DB record

    res.status(200).json({ message: "Link deleted successfully" });
  } catch (err) {
    console.error("Error deleting link:", err);
    res.status(500).json({ message: "Server error" });
  }
};
