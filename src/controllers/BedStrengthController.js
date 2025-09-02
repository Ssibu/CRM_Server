import { Op } from 'sequelize';
import BedStrength from '../models/BedStrength.js';
import fs from 'fs';
import path from 'path';

// Helper to safely delete a file
const normalizeTitle = (str) => {
  return str ? str.trim().replace(/\s+/g, " ") : str;
};
const deleteFile = (filename) => {
    if (filename) {
        const fullPath = path.join('public', 'uploads', 'bed_strengths', filename);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }
};

// --- UPDATED `create` FUNCTION ---
export const create = async (req, res) => {
    try {
        let { en_title, od_title } = req.body;
        if (!req.file || !en_title || !od_title) {
            return res.status(400).json({ message: "All fields and a document are required." });
        }
        
        en_title = normalizeTitle(en_title);
        od_title = normalizeTitle(od_title);
        const documentFilename = path.basename(req.file.path);

        const existingRecord = await BedStrength.findOne({
          where: {
            is_delete: false,
            [Op.or]: [{ en_title }, { od_title }, { document: documentFilename }]
          }
        });

        if (existingRecord) {
          return res.status(409).json({ message: "A record with this title or document already exists." });
        }

        const newRecord = await BedStrength.create({ en_title, od_title, document: documentFilename });
        res.status(201).json({ message: "Record created successfully!", data: newRecord });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          return res.status(409).json({ message: 'This title or document already exists.' });
        }
        res.status(500).json({ message: error.message || "Error creating Bed Strength record." });
    }
};

// THIS IS THE COMPLETE, ADVANCED `findAll` FUNCTION
export const findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    let sortBy = req.query.sort || 'display_order';
    const sortOrder = req.query.order || 'ASC';

    const allowedSortColumns = ['id', 'en_title', 'od_title', 'is_active', 'created_at', 'display_order'];
    if (!allowedSortColumns.includes(sortBy)) {
      sortBy = 'display_order';
    }

    const offset = (page - 1) * limit;

    const whereClause = search ? {
      is_delete: false,
      [Op.or]: [
        { en_title: { [Op.like]: `%${search}%` } },
        { od_title: { [Op.like]: `%${search}%` } },
      ],
    } : { is_delete: false };

    const { count, rows } = await BedStrength.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limit,
      offset: offset,
    });

    return res.json({
      total: count,
      data: rows,
    });
  } catch (error) {
    console.error("Server Error in findAll BedStrength:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Find one Bed Strength record by ID
export const findOne = async (req, res) => {
    try {
        const record = await BedStrength.findOne({ where: { id: req.params.id, is_delete: false } });
        if (record) res.status(200).send(record);
        else res.status(404).send({ message: "Record not found." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Update a Bed Strength record
export const update = async (req, res) => {
    const { id } = req.params;
    try {
        const record = await BedStrength.findByPk(id);
        if (!record) return res.status(404).json({ message: "Record not found." });

        let { en_title, od_title } = req.body;
        en_title = normalizeTitle(en_title);
        od_title = normalizeTitle(od_title);
        const documentFilename = req.file ? path.basename(req.file.path) : record.document;
        
        const potentialDuplicates = [];
        if (en_title && en_title !== record.en_title) potentialDuplicates.push({ en_title });
        if (od_title && od_title !== record.od_title) potentialDuplicates.push({ od_title });
        if (req.file) potentialDuplicates.push({ document: documentFilename });

        if (potentialDuplicates.length > 0) {
            const existingRecord = await BedStrength.findOne({
                where: {
                    is_delete: false,
                    [Op.or]: potentialDuplicates,
                    id: { [Op.ne]: id }
                }
            });
            if (existingRecord) {
                return res.status(409).json({ message: "Another record with this title or document already exists." });
            }
        }
        
        if (req.file && record.document) {
            deleteFile(record.document);
        }
        
        await record.update({ ...req.body, en_title, od_title, document: documentFilename });
        res.status(200).json({ message: "Record updated successfully!", data: record });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          return res.status(409).json({ message: 'This title or document already exists.' });
        }
        res.status(500).json({ message: error.message || "Error updating record." });
    }
};
// Soft Delete a Bed Strength record
export const destroy = async (req, res) => {
    try {
        await BedStrength.update({ is_delete: true }, { where: { id: req.params.id } });
        res.status(200).send({ message: "Record was deleted successfully!" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Toggle Active Status
export const toggleStatus = async (req, res) => {
    try {
        const record = await BedStrength.findByPk(req.params.id);
        if (!record) return res.status(404).send({ message: "Record not found." });
        
        await record.update({ is_active: !record.is_active });
        res.status(200).send({ message: `Status updated successfully.` });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Update Display Order
export const updateOrder = async (req, res) => {
    try {
        const { order } = req.body;
        const transaction = await BedStrength.sequelize.transaction();
        await Promise.all(order.map((id, index) =>
            BedStrength.update({ display_order: index }, { where: { id }, transaction })
        ));
        await transaction.commit();
        res.status(200).send({ message: "Order updated successfully." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};