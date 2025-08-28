import Tender from '../models/Tender.js'; 
import path from "path"
import fs from "fs"
import {Op} from "sequelize"


export const addTender = async (req, res) => {
  try {
    const { en_title, od_title, date, expiry_date } = req.body;

    if (!en_title || !date || !expiry_date) {
      return res.status(400).json({ message: "English title, date, and expiry date are required." });
    }
    if (!req.files || !req.files.nit_doc) {
      return res.status(400).json({ message: "NIT document is a required file." });
    }

    const nitDocFullPath = req.files.nit_doc[0].path;
    const docFullPath = req.files.doc ? req.files.doc[0].path : null;

    const nitDocFilename = path.basename(nitDocFullPath);
    const docFilename = docFullPath ? path.basename(docFullPath) : null;

    const newTender = await Tender.create({
      en_title,
      od_title,
      date,
      expiry_date,
      nit_doc: nitDocFilename, 
      doc: docFilename,    
    });

    res.status(201).json({
      message: "Tender created successfully!",
      data: newTender,
    });

  } catch (error) {
    console.error("Error creating tender:", error);
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: `File is too large. Max size is 1MB.` });
    }
    res.status(500).json({ message: "Server error while creating tender." });
  }
};

export const listTenders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "createdAt";
    const sortOrder = req.query.order || "DESC";

    const allowedSortColumns = ["en_title", "od_title", "date", "expiry_date", "createdAt"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    const whereClause = {
      is_delete: false, // Only show non-deleted tenders
      ...(search && {
        [Op.or]: [
          { en_title: { [Op.like]: `%${search}%` } },
          { od_title: { [Op.like]: `%${search}%` } },
        ],
      })
    };

    const { count, rows } = await Tender.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
    });

    res.status(200).json({
      total: count,
      data: rows,
    });

  } catch (error) {
    console.error("Error listing tenders:", error);
    res.status(500).json({ message: "Server error while listing tenders." });
  }
};

// NEW: Function to toggle the is_active status of a tender
export const toggleTenderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const tender = await Tender.findByPk(id);

        if (!tender) {
            return res.status(404).json({ message: "Tender not found." });
        }

        tender.is_active = !tender.is_active;
        await tender.save();

        res.status(200).json({
            message: `Tender has been ${tender.is_active ? "activated" : "deactivated"}.`,
            data: tender,
        });

    } catch (error) {
        console.error("Error toggling tender status:", error);
        res.status(500).json({ message: "Server error while toggling status." });
    }
};

export const getTenderById = async (req, res) => {
    try {
        const { id } = req.params;
        const tender = await Tender.findByPk(id);

        if (!tender || tender.is_delete) { // Also check if it's soft-deleted
            return res.status(404).json({ message: "Tender not found." });
        }

        res.status(200).json(tender);
    } catch (error) {
        console.error("Error fetching tender:", error);
        res.status(500).json({ message: "Server error while fetching tender." });
    }
};

// NEW: Function to update an existing tender
export const updateTender = async (req, res) => {
    try {
        const { id } = req.params;
        const tender = await Tender.findByPk(id);

        if (!tender) {
            return res.status(404).json({ message: "Tender not found." });
        }

        const { en_title, od_title, date, expiry_date, is_active } = req.body;

        // Handle file updates and old file deletion
        let nitDocFilename = tender.nit_doc;
        if (req.files && req.files.nit_doc) {
            const oldFilePath = path.join('public/uploads/tenders', tender.nit_doc);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath); // Delete the old file
            }
            nitDocFilename = path.basename(req.files.nit_doc[0].path);
        }

        let docFilename = tender.doc;
        if (req.files && req.files.doc) {
            if (tender.doc) { // Check if an old optional doc exists
                const oldFilePath = path.join('public/uploads/tenders', tender.doc);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            docFilename = path.basename(req.files.doc[0].path);
        }

        // Update tender fields
        tender.en_title = en_title || tender.en_title;
        tender.od_title = od_title || tender.od_title;
        tender.date = date || tender.date;
        tender.expiry_date = expiry_date || tender.expiry_date;
        tender.is_active = is_active !== undefined ? is_active : tender.is_active;
        tender.nit_doc = nitDocFilename;
        tender.doc = docFilename;

        await tender.save();

        res.status(200).json({
            message: "Tender updated successfully!",
            data: tender,
        });

    } catch (error) {
        console.error("Error updating tender:", error);
        res.status(500).json({ message: "Server error while updating tender." });
    }
};