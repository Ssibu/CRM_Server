import Scheme from '../models/scheme.model.js';
import fs from 'fs';
import path from 'path';

// Helper to safely delete a file
const deleteFile = (filePath) => {
    if (filePath) {
        // Construct full path from the public directory
        const fullPath = path.join('public', filePath.slice(1));
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }
};

// Create a new Scheme
export const create = async (req, res) => {
    try {
        const { en_title, od_title } = req.body;
        if (!req.file || !en_title || !od_title) {
            return res.status(400).send({ message: "All fields and a document are required." });
        }
        const newScheme = await Scheme.create({ ...req.body, document: req.file.path });
        res.status(201).send(newScheme);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Find all Schemes that are not soft-deleted
export const findAll = async (req, res) => {
    try {
        const schemes = await Scheme.findAll({ 
            where: { is_delete: false },
            order: [['displayOrder', 'ASC']] 
        });
        res.status(200).send(schemes);
    } catch (error) {
        res.status(500).send({ message: error.message });
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
    try {
        const scheme = await Scheme.findByPk(req.params.id);
        if (!scheme) return res.status(404).send({ message: "Scheme not found." });
        
        const updatedData = { ...req.body, document: req.file ? req.file.path : scheme.document };
        if (req.file && scheme.document) deleteFile(scheme.document);
        
        await scheme.update(updatedData);
        res.status(200).send(scheme);
    } catch (error) {
        res.status(500).send({ message: error.message });
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