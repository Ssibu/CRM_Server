import models from '../models/index.js';
import path from 'path';
import fs from 'fs';
import { Op } from 'sequelize';

const { Tender, Corrigendum } = models;

/**
 * @desc    List all corrigendums for a specific tender
 * @route   GET /api/tenders/:tenderId/corrigendums
 * @access  Public (or Private depending on your auth)
 */
export const listCorrigendumsForTender = async (req, res) => {
    try {
        const { tenderId } = req.params;
        // Optional: Check if parent tender exists
        const tender = await Tender.findByPk(tenderId);
        if (!tender) {
            return res.status(404).json({ message: "Parent tender not found." });
        }

        const corrigendums = await Corrigendum.findAll({
            where: { tenderId, is_delete: false },
            order: [['date', 'DESC']],
        });
        res.status(200).json(corrigendums);
    } catch (error) {
        console.error("Error listing corrigendums:", error);
        res.status(500).json({ message: "Server error while fetching corrigendums." });
    }
};

/**
 * @desc    Add a new corrigendum to a specific tender
 * @route   POST /api/tenders/:tenderId/corrigendums
 * @access  Private/Admin
 */
export const addCorrigendum = async (req, res) => {
    try {
        const { tenderId } = req.params;
        const { en_title, od_title, date, expiry_date } = req.body;

        if (!en_title || !date || !expiry_date) {
            return res.status(400).json({ message: "English title, date, and expiry date are required." });
        }
        if (!req.file) {
            return res.status(400).json({ message: "Corrigendum document is a required file." });
        }

        const tender = await Tender.findByPk(tenderId);
        if (!tender) {
            // Clean up the uploaded file if the parent doesn't exist
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: "Parent tender not found." });
        }

        const newCorrigendum = await Corrigendum.create({
            en_title,
            od_title,
            date,
            expiry_date,
            tenderId: parseInt(tenderId, 10),
            cor_document: path.basename(req.file.path), // Save only the filename
        });

        res.status(201).json({ message: "Corrigendum added successfully!", data: newCorrigendum });
    } catch (error) {
        console.error("Error adding corrigendum:", error);
        res.status(500).json({ message: "Server error while adding corrigendum." });
    }
};

/**
 * @desc    Get a single corrigendum by its ID
 * @route   GET /api/corrigendums/:id
 * @access  Public (or Private)
 */
export const getCorrigendumById = async (req, res) => {
    try {
        const { id } = req.params;
        const corrigendum = await Corrigendum.findByPk(id);

        if (!corrigendum || corrigendum.is_delete) {
            return res.status(404).json({ message: "Corrigendum not found." });
        }
        res.status(200).json(corrigendum);
    } catch (error) {
        console.error("Error fetching corrigendum:", error);
        res.status(500).json({ message: "Server error." });
    }
};

/**
 * @desc    Update a specific corrigendum
 * @route   PATCH /api/corrigendums/:id
 * @access  Private/Admin
 */
export const updateCorrigendum = async (req, res) => {
    try {
        const { id } = req.params;
        const corrigendum = await Corrigendum.findByPk(id);

        if (!corrigendum) {
            return res.status(404).json({ message: "Corrigendum not found." });
        }

        const { en_title, od_title, date, expiry_date, is_active } = req.body;

        let corDocumentFilename = corrigendum.cor_document;
        if (req.file) {
            // A new file is uploaded, delete the old one
            const oldFilePath = path.join('public/uploads/corrigendums', corrigendum.cor_document);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
            corDocumentFilename = path.basename(req.file.path);
        }

        // Update fields
        corrigendum.en_title = en_title || corrigendum.en_title;
        corrigendum.od_title = od_title || corrigendum.od_title;
        corrigendum.date = date || corrigendum.date;
        corrigendum.expiry_date = expiry_date || corrigendum.expiry_date;
        corrigendum.is_active = is_active !== undefined ? is_active : corrigendum.is_active;
        corrigendum.cor_document = corDocumentFilename;

        await corrigendum.save();

        res.status(200).json({ message: "Corrigendum updated successfully!", data: corrigendum });
    } catch (error) {
        console.error("Error updating corrigendum:", error);
        res.status(500).json({ message: "Server error while updating corrigendum." });
    }
};

/**
 * @desc    Toggle the active status of a corrigendum
 * @route   PATCH /api/corrigendums/:id/status
 * @access  Private/Admin
 */
export const toggleCorrigendumStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const corrigendum = await Corrigendum.findByPk(id);

        if (!corrigendum) {
            return res.status(404).json({ message: "Corrigendum not found." });
        }

        corrigendum.is_active = !corrigendum.is_active;
        await corrigendum.save();

        res.status(200).json({
            message: `Corrigendum has been ${corrigendum.is_active ? "activated" : "deactivated"}.`,
            data: corrigendum,
        });
    } catch (error) {
        console.error("Error toggling corrigendum status:", error);
        res.status(500).json({ message: "Server error." });
    }
};