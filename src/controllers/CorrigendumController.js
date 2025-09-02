import models from '../models/index.js';
import path from 'path';
import fs from 'fs';
import { Op } from 'sequelize';

const { Tender, Corrigendum } = models;

const normalizeTitle = (str) => {
  return str
    ? str.trim().replace(/\s+/g, " ") 
    : str;
};

export const listCorrigendumsForTender = async (req, res) => {
    try {
        const { tenderId } = req.params;
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


export const addCorrigendum = async (req, res) => {
  try {
    const { tenderId } = req.params;
    let { en_title, od_title, date, remarks } = req.body;

    if (!en_title || !od_title|| !date ) {
      return res.status(400).json({ message: "English title Odia title and date are required." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Corrigendum document is a required file." });
    }

    en_title = normalizeTitle(en_title);
    od_title = normalizeTitle(od_title);

    const tender = await Tender.findByPk(tenderId);
    if (!tender) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Parent tender not found." });
    }

    const newCorrigendum = await Corrigendum.create({
      en_title,
      od_title,
      date,
      tenderId: parseInt(tenderId, 10),
      cor_document: path.basename(req.file.path),
      remarks
    });

    res.status(201).json({ message: "Corrigendum added successfully!", data: newCorrigendum });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError' || error.original?.errno === 1062) {
      return res.status(400).json({ message: "Corrigendum with this title already exists." });
    }
    console.error("Error adding corrigendum:", error);
    res.status(500).json({ message: "Server error while adding corrigendum." });
  }
};


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




export const updateCorrigendum = async (req, res) => {
  try {
    const { id } = req.params;
    const corrigendum = await Corrigendum.findByPk(id);

    if (!corrigendum) {
      return res.status(404).json({ message: "Corrigendum not found." });
    }

    let { en_title, od_title, date, is_active, remarks } = req.body;
    en_title = normalizeTitle(en_title);
    od_title = normalizeTitle(od_title);

    let corDocumentFilename = corrigendum.cor_document;
    if (req.file) {
      const oldFilePath = path.join(
        "public/uploads/corrigendums",
        corrigendum.cor_document
      );
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      corDocumentFilename = path.basename(req.file.path);
    }

    corrigendum.en_title = en_title || corrigendum.en_title;
    corrigendum.od_title = od_title || corrigendum.od_title;
    corrigendum.date = date || corrigendum.date;
    corrigendum.remarks = remarks || corrigendum.remarks;
    corrigendum.is_active =
      is_active !== undefined ? is_active : corrigendum.is_active;
    corrigendum.cor_document = corDocumentFilename;

    await corrigendum.save();

    res
      .status(200)
      .json({
        message: "Corrigendum updated successfully!",
        data: corrigendum,
      });
  } catch (error) {
    if (
      error.name === "SequelizeUniqueConstraintError" ||
      error.original?.errno === 1062
    ) {
      return res
        .status(400)
        .json({ message: "Corrigendum with this title already exists." });
    }
    console.error("Error updating corrigendum:", error);
    res
      .status(500)
      .json({ message: "Server error while updating corrigendum." });
  }
};


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