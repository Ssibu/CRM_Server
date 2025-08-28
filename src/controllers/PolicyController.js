import Policy from '../models/Policy.js';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';

// --- Helper to manage file deletion ---
const deleteFile = (filePath) => {
    if (filePath) {
        const fullPath = path.join('public', filePath.slice(1));
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }
};

// Create a new Policy
export const create = async (req, res) => {
    try {
        const { en_title, od_title } = req.body;
        if (!req.file || !en_title || !od_title) {
            return res.status(400).send({ message: "All fields and a document are required." });
        }
        const newPolicy = await Policy.create({ ...req.body, document: req.file.path });
        res.status(201).send(newPolicy);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Find all Policies (that are not soft-deleted)
export const findAll = async (req, res) => {
  try {
    // Get query params from the hook, with defaults
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    let sortBy = req.query.sort || 'displayOrder';
    const sortOrder = req.query.order || 'ASC';

    // Security: Whitelist sortable columns
    const allowedSortColumns = ['id', 'en_title', 'od_title', 'is_active', 'created_at', 'displayOrder'];
    if (!allowedSortColumns.includes(sortBy)) {
      sortBy = 'displayOrder'; // Fallback to a safe default
    }

    const offset = (page - 1) * limit;

    // Build the search clause and ensure soft-deleted items are excluded
    const whereClause = search ? {
      is_delete: false,
      [Op.or]: [
        { en_title: { [Op.like]: `%${search}%` } },
        { od_title: { [Op.like]: `%${search}%` } },
      ],
    } : { is_delete: false };

    // Use findAndCountAll to get both the data rows and the total count
    const { count, rows } = await Policy.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limit,
      offset: offset,
    });

    // Return the data in the format the frontend hook expects
    return res.json({
      total: count,
      data: rows,
    });

  } catch (error) {
    console.error("Server Error in findAll Policies:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Find one Policy by ID
export const findOne = async (req, res) => {
    try {
        const policy = await Policy.findByPk(req.params.id);
        res.status(200).send(policy);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Update a Policy
export const update = async (req, res) => {
    try {
        const policy = await Policy.findByPk(req.params.id);
        if (!policy) return res.status(404).send({ message: "Policy not found." });
        
        const updatedData = { ...req.body, document: req.file ? req.file.path : policy.document };
        if (req.file && policy.document) deleteFile(policy.document);
        
        await policy.update(updatedData);
        res.status(200).send(policy);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Soft Delete a Policy
export const destroy = async (req, res) => {
    try {
        await Policy.update({ is_delete: true }, { where: { id: req.params.id } });
        res.status(200).send({ message: "Policy was deleted successfully!" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Toggle Active Status
export const toggleStatus = async (req, res) => {
    try {
        const policy = await Policy.findByPk(req.params.id);
        if (!policy) return res.status(404).send({ message: "Policy not found." });
        
        const newStatus = !policy.is_active;
        await policy.update({ is_active: newStatus });
        res.status(200).send({ message: `Status updated successfully.` });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Update Display Order
export const updateOrder = async (req, res) => {
    try {
        const { order } = req.body;
        const transaction = await Policy.sequelize.transaction();
        await Promise.all(order.map((id, index) =>
            Policy.update({ displayOrder: index }, { where: { id }, transaction })
        ));
        await transaction.commit();
        res.status(200).send({ message: "Order updated successfully." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};