import Notice from '../../models/Notice.js'; 
import path from "path";
import fs from "fs";
import { Op } from "sequelize";
import {log} from "../../services/LogService.js"


const [LIST, EDIT, ADD, C, R, U] = [
  "NOTICE LIST",
  "NOTICE EDIT",
  "NOTICE ADD",
  "CREATE",
  "READ",
  "UPDATE"
];

const normalizeTitle = (str) => {
  return str
    ? str.trim().replace(/\s+/g, " ")
    : str;
};

export const addNotice = async (req, res) => {
  try {
    let { en_title, od_title, date } = req.body;

    if (!en_title || !date) {
      return res.status(400).json({ message: "English title and date are required." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Notice document is required." });
    }

    en_title = normalizeTitle(en_title);
    od_title = normalizeTitle(od_title);

    const docFilename = path.basename(req.file.path);

    const newNotice = await Notice.create({
      en_title,
      od_title,
      date,
      doc: docFilename,
    });

    
      await log({
          req,
          action: C,
          page_name: ADD,
          target: newNotice.en_title,
        });

    res.status(201).json({
      message: "Notice created successfully!",
      data: newNotice,
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError' || error.original?.errno === 1062) {
      return res.status(400).json({ message: "Notice with this title already exists." });
    }
    console.error("Error creating notice:", error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: `File is too large. Max size is 1MB.` });
    }
    res.status(500).json({ message: "Server error while creating notice." });
  }
};



export const listNotices = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "date"; 
    const sortOrder = req.query.order || "DESC";

    const allowedSortColumns = ["en_title", "od_title", "date", "is_active", "createdAt"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    const whereClause = {
      is_delete: false,
      ...(search && {
        [Op.or]: [
          { en_title: { [Op.like]: `%${search}%` } },
          { od_title: { [Op.like]: `%${search}%` } },
        ],
      })
    };

    const { count, rows } = await Notice.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
    });

      await log({
          req,
          action: R,
          page_name: LIST,
        });

    res.status(200).json({
      total: count,
      data: rows,
    });

  } catch (error) {
    console.error("Error listing notices:", error);
    res.status(500).json({ message: "Server error while listing notices." });
  }
};

export const toggleNoticeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const notice = await Notice.findByPk(id);

        if (!notice) {
            return res.status(404).json({ message: "Notice not found." });
        }

        notice.is_active = !notice.is_active;
        await notice.save();
        
      await log({
          req,
          action: U,
          page_name: LIST,
          target: notice.en_title,
        });

        res.status(200).json({
            message: `Notice has been ${notice.is_active ? "activated" : "deactivated"}.`,
            data: notice,
        });

    } catch (error) {
        console.error("Error toggling notice status:", error);
        res.status(500).json({ message: "Server error while toggling status." });
    }
};


export const getNoticeById = async (req, res) => {
    try {
        const { id } = req.params;
        const notice = await Notice.findByPk(id);

        if (!notice || notice.is_delete) {
            return res.status(404).json({ message: "Notice not found." });
        }

        res.status(200).json(notice);
    } catch (error) {
        console.error("Error fetching notice:", error);
        res.status(500).json({ message: "Server error while fetching notice." });
    }
};


export const updateNotice = async (req, res) => {
   try {
        const { id } = req.params;
        const notice = await Notice.findByPk(id);

        if (!notice) {
            return res.status(404).json({ message: "Notice not found." });
        }

        let { en_title, od_title, date, is_active, removeDoc } = req.body; // Add removeDoc

        en_title = normalizeTitle(en_title);
        od_title = normalizeTitle(od_title);

        let docFilename = notice.doc;
        const oldFilePath = notice.doc ? path.join('public/uploads/notices', notice.doc) : null;

        if (req.file) { 
            if (oldFilePath && fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath); 
            }
            docFilename = path.basename(req.file.path);
        } else if (removeDoc === 'true') { 
            if (oldFilePath && fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath); 
            }
            docFilename = null; 
        }


        notice.en_title = en_title || notice.en_title;
        notice.od_title = od_title || notice.od_title;
        notice.date = date || notice.date;
        notice.is_active = is_active !== undefined ? is_active : notice.is_active;
        notice.doc = docFilename;

        await notice.save();
        
      await log({
          req,
          action: U,
          page_name: EDIT,
          target: notice.en_title,
        });

        res.status(200).json({
            message: "Notice updated successfully!",
            data: notice,
        });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError' || error.original?.errno === 1062) {
      return res.status(400).json({ message: "Notice with this title already exists." });
    }
    console.error("Error updating notice:", error);
    res.status(500).json({ message: "Server error while updating notice." });
  }
};