import { Op } from 'sequelize';
import BedStrength from '../models/BedStrength.js';
import fs from 'fs';
import path from 'path';

// Helper to safely delete a file
const deleteFile = (filePath) => {
    if (filePath) {
        const fullPath = path.join('public', filePath.startsWith('/') ? filePath.slice(1) : filePath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
};

// Create a new Bed Strength record
export const create = async (req, res) => {
    try {
        const { en_title, od_title } = req.body;
        if (!req.file || !en_title || !od_title) {
            return res.status(400).send({ message: "All fields and a document are required." });
        }
        const newRecord = await BedStrength.create({ ...req.body, document: req.file.path });
        res.status(201).send(newRecord);
    } catch (error) {
        res.status(500).send({ message: error.message || "Error creating Bed Strength record." });
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
    try {
        const record = await BedStrength.findByPk(req.params.id);
        if (!record) return res.status(404).send({ message: "Record not found." });
        
        const updatedData = { ...req.body, document: req.file ? req.file.path : record.document };
        if (req.file && record.document) deleteFile(record.document);
        
        await record.update(updatedData);
        res.status(200).send(record);
    } catch (error) {
        res.status(500).send({ message: error.message });
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