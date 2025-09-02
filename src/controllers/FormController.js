import Form from '../models/Form.js';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';

// Helper to safely delete a file from the public directory
const normalizeTitle = (str) => {
  return str ? str.trim().replace(/\s+/g, " ") : str;
};

// --- CORRECTED: Helper to manage file deletion from the 'forms' subdirectory ---
const deleteFile = (filename) => {
    if (filename) {
        const fullPath = path.join('public', 'uploads', 'forms', filename);
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

        const existingForm = await Form.findOne({
          where: {
            is_delete: false,
            [Op.or]: [{ en_title }, { od_title }, { document: documentFilename }]
          }
        });

        if (existingForm) {
          return res.status(409).json({ message: "A form with this title or document already exists." });
        }

        const newForm = await Form.create({ en_title, od_title, document: documentFilename });
        res.status(201).json({ message: "Form created successfully!", data: newForm });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          return res.status(409).json({ message: 'This title or document already exists.' });
        }
        res.status(500).json({ message: error.message || "Error creating Form." });
    }
};
// Find all Forms that are not soft-deleted
export const findAll = async (req, res) => {
  try {
    // Get query params from the useServerSideTable hook, with defaults
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    let sortBy = req.query.sort || 'displayOrder';
    const sortOrder = req.query.order || 'ASC';

    // Security: Whitelist the columns that are allowed to be sorted
    const allowedSortColumns = ['id', 'en_title', 'od_title', 'is_active', 'created_at', 'displayOrder'];
    if (!allowedSortColumns.includes(sortBy)) {
      sortBy = 'displayOrder'; // Fallback to a safe default column
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

    // Use findAndCountAll to get both the data rows for the page and the total count
    const { count, rows } = await Form.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limit,
      offset: offset,
    });

    // Return the data in the specific object format that the frontend hook expects
    return res.json({
      total: count,
      data: rows,
    });

  } catch (error) {
    console.error("Server Error in findAll Forms:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Find one Form by ID
export const findOne = async (req, res) => {
    try {
        const form = await Form.findOne({ where: { id: req.params.id, is_delete: false } });
        if (form) {
            res.status(200).send(form);
        } else {
            res.status(404).send({ message: "Form not found." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message || "Error retrieving Form." });
    }
};

// Update a Form
export const update = async (req, res) => {
    const { id } = req.params;
    try {
        const form = await Form.findByPk(id);
        if (!form) return res.status(404).json({ message: "Form not found." });

        let { en_title, od_title } = req.body;
        en_title = normalizeTitle(en_title);
        od_title = normalizeTitle(od_title);
        const documentFilename = req.file ? path.basename(req.file.path) : form.document;
        
        const potentialDuplicates = [];
        if (en_title && en_title !== form.en_title) potentialDuplicates.push({ en_title });
        if (od_title && od_title !== form.od_title) potentialDuplicates.push({ od_title });
        if (req.file) potentialDuplicates.push({ document: documentFilename });

        if (potentialDuplicates.length > 0) {
            const existingForm = await Form.findOne({
                where: {
                    is_delete: false,
                    [Op.or]: potentialDuplicates,
                    id: { [Op.ne]: id }
                }
            });
            if (existingForm) {
                return res.status(409).json({ message: "Another form with this title or document already exists." });
            }
        }
        
        // If a new file was uploaded, delete the old one
        if (req.file && form.document) {
            deleteFile(form.document);
        }
        
        await form.update({ ...req.body, en_title, od_title, document: documentFilename });
        res.status(200).json({ message: "Form updated successfully!", data: form });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          return res.status(409).json({ message: 'This title or document already exists.' });
        }
        res.status(500).json({ message: error.message || "Error updating Form." });
    }
};

// Soft Delete a Form
export const destroy = async (req, res) => {
    try {
        await Form.update({ is_delete: true }, { where: { id: req.params.id } });
        res.status(200).send({ message: "Form was deleted successfully!" });
    } catch (error) {
        res.status(500).send({ message: error.message || "Error deleting Form." });
    }
};

// Toggle Active Status
export const toggleStatus = async (req, res) => {
    try {
        const form = await Form.findByPk(req.params.id);
        if (!form) return res.status(404).send({ message: "Form not found." });
        
        await form.update({ is_active: !form.is_active });
        res.status(200).send({ message: `Status updated successfully.` });
    } catch (error) {
        res.status(500).send({ message: error.message || "Error toggling status." });
    }
};

// Update Display Order
export const updateOrder = async (req, res) => {
    try {
        const { order } = req.body;
        const transaction = await Form.sequelize.transaction();
        await Promise.all(order.map((id, index) =>
            Form.update({ displayOrder: index }, { where: { id }, transaction })
        ));
        await transaction.commit();
        res.status(200).send({ message: "Order updated successfully." });
    } catch (error) {
        res.status(500).send({ message: error.message || "Error updating order." });
    }
};