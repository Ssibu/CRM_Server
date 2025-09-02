import Policy from '../models/Policy.js';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';

const normalizeTitle = (str) => {
  return str ? str.trim().replace(/\s+/g, " ") : str;
};

// Helper to manage file deletion
const deleteFile = (filename) => {
    if (filename) {
        const fullPath = path.join('public', 'uploads', 'policies', filename);
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
        
        // Use the helper to clean the titles
        en_title = normalizeTitle(en_title);
        od_title = normalizeTitle(od_title);
        const documentFilename = path.basename(req.file.path);

        const existingPolicy = await Policy.findOne({
          where: {
            is_delete: false,
            [Op.or]: [
              { en_title },
              { od_title },
              { document: documentFilename }
            ]
          }
        });

        if (existingPolicy) {
          return res.status(409).json({ message: "A policy with this title or document already exists." });
        }

        const newPolicy = await Policy.create({ en_title, od_title, document: documentFilename });
        res.status(201).json({ message: "Policy created successfully!", data: newPolicy });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          return res.status(409).json({ message: 'This title or document already exists.' });
        }
        res.status(500).json({ message: error.message || "Error creating Policy." });
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
    const { id } = req.params;
    try {
        const policy = await Policy.findByPk(id);
        if (!policy) return res.status(404).json({ message: "Policy not found." });

        let { en_title, od_title } = req.body;
        // Use the helper to clean the titles
        en_title = normalizeTitle(en_title);
        od_title = normalizeTitle(od_title);
        
        const documentFilename = req.file ? path.basename(req.file.path) : policy.document;
        
        const potentialDuplicates = [];
        if (en_title && en_title !== policy.en_title) potentialDuplicates.push({ en_title });
        if (od_title && od_title !== policy.od_title) potentialDuplicates.push({ od_title });
        if (req.file) potentialDuplicates.push({ document: documentFilename });

        if (potentialDuplicates.length > 0) {
            const existingPolicy = await Policy.findOne({
                where: {
                    is_delete: false,
                    [Op.or]: potentialDuplicates,
                    id: { [Op.ne]: id }
                }
            });
            if (existingPolicy) {
                return res.status(409).json({ message: "Another policy with this title or document already exists." });
            }
        }
        
        if (req.file && policy.document) {
            deleteFile(policy.document);
        }
        
        await policy.update({ ...req.body, en_title, od_title, document: documentFilename });
        res.status(200).json({ message: "Policy updated successfully!", data: policy });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          return res.status(409).json({ message: 'This title or document already exists.' });
        }
        res.status(500).json({ message: error.message || "Error updating Policy." });
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