import Scheme from '../models/Scheme.js';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';

// Helper to safely delete a file
const deleteFile = (filePath) => {
    if (filePath) {
        const fullPath = path.join('public', filePath.startsWith('/') ? filePath.slice(1) : filePath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
};

// --- UPDATED `create` FUNCTION ---
export const create = async (req, res) => {
    try {
        const { en_title, od_title } = req.body;
        if (!req.file || !en_title || !od_title) {
            return res.status(400).send({ message: "All fields and a document are required." });
        }

        // Validation: Check for duplicates before creating
        const existingScheme = await Scheme.findOne({
          where: {
            is_delete: false,
            [Op.or]: [
              { en_title: en_title },
              { od_title: od_title },
              { document: req.file.path }
            ]
          }
        });

        if (existingScheme) {
          return res.status(409).send({ message: "A scheme with this title or document already exists." });
        }

        const newScheme = await Scheme.create({ ...req.body, document: req.file.path });
        res.status(201).send(newScheme);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          return res.status(409).send({ message: 'This title or document already exists.' });
        }
        res.status(500).send({ message: error.message || "Error creating Scheme." });
    }
};

// Find all Schemes that are not soft-deleted
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
    const { count, rows } = await Scheme.findAndCountAll({
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
    console.error("Server Error in findAll Schemes:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Find one Scheme by ID
export const findOne = async (req, res) => {
    try {
        const scheme = await Scheme.findOne({ where: { id: req.params.id, is_delete: false } });
        if (scheme) {
            res.status(200).send(scheme);
        } else {
            res.status(404).send({ message: "Scheme not found." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Update a Scheme
export const update = async (req, res) => {
    const { id } = req.params;
    const { en_title, od_title } = req.body;
    try {
        // Validation: Check for duplicates on OTHER records
        if (en_title || od_title || req.file) {
            const potentialDuplicates = [];
            if (en_title) potentialDuplicates.push({ en_title });
            if (od_title) potentialDuplicates.push({ od_title });
            if (req.file) potentialDuplicates.push({ document: req.file.path });

            const existingScheme = await Scheme.findOne({
                where: {
                    is_delete: false,
                    [Op.or]: potentialDuplicates,
                    id: {
                        [Op.ne]: id // Exclude the current record
                    }
                }
            });

            if (existingScheme) {
                return res.status(409).send({ message: "Another scheme with this title or document already exists." });
            }
        }

        const scheme = await Scheme.findByPk(id);
        if (!scheme) return res.status(404).send({ message: "Scheme not found." });
        
        const updatedData = { ...req.body, document: req.file ? req.file.path : scheme.document };
        if (req.file && scheme.document) deleteFile(scheme.document);
        
        await scheme.update(updatedData);
        res.status(200).send(scheme);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          return res.status(409).send({ message: 'This title or document already exists.' });
        }
        res.status(500).send({ message: error.message || "Error updating Scheme." });
    }
};

// Soft Delete a Scheme (sets is_delete to true)
export const destroy = async (req, res) => {
    try {
        await Scheme.update({ is_delete: true }, { where: { id: req.params.id } });
        res.status(200).send({ message: "Scheme was deleted successfully!" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Toggle Active Status
export const toggleStatus = async (req, res) => {
    try {
        const scheme = await Scheme.findByPk(req.params.id);
        if (!scheme) return res.status(404).send({ message: "Scheme not found." });
        
        await scheme.update({ is_active: !scheme.is_active });
        res.status(200).send({ message: `Status updated successfully.` });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Update Display Order
export const updateOrder = async (req, res) => {
    try {
        const { order } = req.body;
        const transaction = await Scheme.sequelize.transaction();
        await Promise.all(order.map((id, index) =>
            Scheme.update({ displayOrder: index }, { where: { id }, transaction })
        ));
        await transaction.commit();
        res.status(200).send({ message: "Order updated successfully." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};