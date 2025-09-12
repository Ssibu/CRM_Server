import Tender from '../../models/Tender.js'; 
import path from "path"
import fs from "fs"
import {Op} from "sequelize"
import { log } from '../../services/LogService.js';
import { reformatDate } from '../../utils/reformat-date.js';

const [LIST, EDIT, ADD, C, R, U] = [
  "TENDER LIST",
  "TENDER EDIT",
  "TENDER ADD",
  "CREATE",
  "READ",
  "UPDATE"
];

const normalizeTitle = (str) => {
  return str
    ? str.trim().replace(/\s+/g, " ") 
    : str;
};


export const addTender = async (req, res) => {
  try {
    let { en_title, od_title, date, expiry_date } = req.body;

    if (!en_title || !date || !expiry_date) {
      return res.status(400).json({ message: "English title, date, and expiry date are required." });
    }

  const startDate = new Date(date);
    const endDate = new Date(expiry_date);

    if (endDate < startDate) {
      return res.status(400).json({ message: "Expiry date cannot be earlier than the tender date." });
    }


    if (!req.files || !req.files.nit_doc) {
      return res.status(400).json({ message: "NIT document is a required file." });
    }

    en_title = normalizeTitle(en_title);
    od_title = normalizeTitle(od_title);

    const nitDocFullPath = req.files.nit_doc[0].path;
    const docFullPath = req.files.doc ? req.files.doc[0].path : null;

    const nitDocFilename = path.basename(nitDocFullPath);
    const docFilename = docFullPath ? path.basename(docFullPath) : null;

    const newTender = await Tender.create({
      en_title,
      od_title,
      date,
      expiry_date,
      nit_doc: nitDocFilename, 
      doc: docFilename,    
    });


          await log({
              req,
              action: C,
              page_name: ADD,
              target: newTender.en_title,
            });

    res.status(201).json({
      message: "Tender created successfully!",
      data: newTender,
    });

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError' || error.original?.errno === 1062) {
      return res.status(400).json({ message: "Tender with this title already exists." });
    }

    console.error("Error creating tender:", error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: `File is too large. Max size is 1MB.` });
    }
    res.status(500).json({ message: "Server error while creating tender." });
  }
};

export const listTenders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = (req.query.search || "").trim();
    const sortBy = req.query.sort || "createdAt";
    const sortOrder = req.query.order || "DESC";

    const allowedSortColumns = ["en_title", "od_title", "date", "expiry_date", "is_active", "createdAt"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    const formattedDate = reformatDate(search)

    const whereClause = {
      is_delete: false, 
      ...(search && {
        [Op.or]: [
          { en_title: { [Op.like]: `%${search}%` } },
          { od_title: { [Op.like]: `%${search}%` } },
          { date: { [Op.like]: `%${formattedDate}%` } },
          { expiry_date: { [Op.like]: `%${formattedDate}%` } },
        ],
      })
    };

    const { count, rows } = await Tender.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
    });

    
      if(search){
        await log({
          req,
          action: R,
          page_name: "SEARCH",
        });
      } else{
        await log({
          req,
          action: R,
          page_name: LIST,
        });
      }

    res.status(200).json({
      total: count,
      data: rows,
    });

  } catch (error) {
    console.error("Error listing tenders:", error);
    res.status(500).json({ message: "Server error while listing tenders." });
  }
};

export const toggleTenderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const tender = await Tender.findByPk(id);

        if (!tender) {
            return res.status(404).json({ message: "Tender not found." });
        }

        tender.is_active = !tender.is_active;
        await tender.save();
        
      await log({
          req,
          action: U,
          page_name: LIST,
          target: tender.en_title || tender.id,
        });

        res.status(200).json({
            message: `Tender has been ${tender.is_active ? "activated" : "deactivated"}.`,
            data: tender,
        });

    } catch (error) {
        console.error("Error toggling tender status:", error);
        res.status(500).json({ message: "Server error while toggling status." });
    }
};

export const getTenderById = async (req, res) => {
    try {
        const { id } = req.params;
        const tender = await Tender.findByPk(id);

        if (!tender || tender.is_delete) {
            return res.status(404).json({ message: "Tender not found." });
        }

        res.status(200).json(tender);
    } catch (error) {
        console.error("Error fetching tender:", error);
        res.status(500).json({ message: "Server error while fetching tender." });
    }
};



export const updateTender = async (req, res) => {
  try {
    const { id } = req.params;
    const tender = await Tender.findByPk(id);

    if (!tender) {
      return res.status(404).json({ message: "Tender not found." });
    }

    let { en_title, od_title, date, expiry_date, is_active, remove_nit_doc, remove_doc } = req.body;

    en_title = normalizeTitle(en_title) || tender.en_title;
    od_title = normalizeTitle(od_title) || tender.od_title;

    let nitDocFilename = tender.nit_doc;
    const oldNitPath = tender.nit_doc ? path.join('public/uploads/tenders', tender.nit_doc) : null;

    if (req.files && req.files.nit_doc) { 
      if (oldNitPath && fs.existsSync(oldNitPath)) {
        fs.unlinkSync(oldNitPath);
      }
      nitDocFilename = path.basename(req.files.nit_doc[0].path);
    } else if (remove_nit_doc === 'true') { 
      if (oldNitPath && fs.existsSync(oldNitPath)) {
        fs.unlinkSync(oldNitPath);
      }
      nitDocFilename = null;
    }

    let docFilename = tender.doc;
    const oldDocPath = tender.doc ? path.join('public/uploads/tenders', tender.doc) : null;

    if (req.files && req.files.doc) { 
      if (oldDocPath && fs.existsSync(oldDocPath)) {
        fs.unlinkSync(oldDocPath);
      }
      docFilename = path.basename(req.files.doc[0].path);
    } else if (remove_doc === 'true') { 
       if (oldDocPath && fs.existsSync(oldDocPath)) {
        fs.unlinkSync(oldDocPath);
      }
      docFilename = null; 
    }

    tender.en_title = en_title;
    tender.od_title = od_title;
    tender.date = date || tender.date;
    tender.expiry_date = expiry_date || tender.expiry_date;
    tender.is_active = is_active !== undefined ? is_active : tender.is_active;
    tender.nit_doc = nitDocFilename;
    tender.doc = docFilename;

    await tender.save();

    
      await log({
          req,
          action: U,
          page_name: EDIT,
          target: tender.en_title || tender.id ,
        });

    res.status(200).json({
      message: "Tender updated successfully!",
      data: tender,
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError' || error.original?.errno === 1062) {
      return res.status(400).json({ message: "Tender with this title already exists." });
    }
    console.error("Error updating tender:", error);
    res.status(500).json({ message: "Server error while updating tender." });
  }
};