import models from '../../models/index.js';
import path from 'path';
import fs from 'fs';
import { log } from '../../services/LogService.js';

const { Tender, Corrigendum } = models;

const [LIST, EDIT, ADD, C, R, U] = [
  "CORRIGENDUM LIST",
  "CORRIGENDUM EDIT",
  "CORRIGENDUM ADD",
  "CREATE",
  "READ",
  "UPDATE"
];

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
            order: [['createdAt', 'DESC']],
        });
        await log({
              req,
              action: R,
              page_name: LIST
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
    let { remarks } = req.body;

   
    if (!req.file) {
      return res.status(400).json({ message: "Corrigendum document is a required file." });
    }


    const tender = await Tender.findByPk(tenderId);
    if (!tender) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Parent tender not found." });
    }

    const newCorrigendum = await Corrigendum.create({

      tenderId: parseInt(tenderId, 10),
      cor_document: path.basename(req.file.path),
      remarks
    });
    await log({
              req,
              action: C,
              page_name: ADD,
              target: newCorrigendum.en_title
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




export const toggleCorrigendumStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const corrigendum = await Corrigendum.findByPk(id);

        if (!corrigendum) {
            return res.status(404).json({ message: "Corrigendum not found." });
        }

        corrigendum.is_active = !corrigendum.is_active;
        await corrigendum.save();
           await log({
              req,
              action: U,
              page_name: LIST,
              target: corrigendum.en_title || corrigendum.id
            });

        res.status(200).json({
            message: `Corrigendum has been ${corrigendum.is_active ? "activated" : "deactivated"}.`,
            data: corrigendum,
        });
    } catch (error) {
        console.error("Error toggling corrigendum status:", error);
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

    let {  is_active, remarks, remove_cor_document } = req.body;
    
    let corDocumentFilename = corrigendum.cor_document;
    const oldFilePath = corrigendum.cor_document

      ? path.join("public/uploads/corrigendums", corrigendum.cor_document)
      : null;

    if (req.file) {
      if (oldFilePath && fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath); 
      }
      corDocumentFilename = path.basename(req.file.path);
    } else if (remove_cor_document === 'true') {
      if (oldFilePath && fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      corDocumentFilename = null; 
    }


    corrigendum.remarks = remarks || corrigendum.remarks;
    corrigendum.is_active =
      is_active !== undefined ? is_active : corrigendum.is_active;
    corrigendum.cor_document = corDocumentFilename; 

    await corrigendum.save();
       await log({
              req,
              action: U,
              page_name: EDIT,
              target: corrigendum.en_title || corrigendum.id
            });

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
