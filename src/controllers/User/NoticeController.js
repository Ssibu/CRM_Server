import models from '../../models/index.js';
import { Op } from "sequelize";

const {Notice} = models

export const getPublicNotices = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
   const sortBy = req.query.sort || "date";
    const sortOrder = req.query.order || "DESC";

     const allowedSortColumns = ['en_title', 'od_title', 'date'];
    if (!allowedSortColumns.includes(sortBy)) {
        return res.status(400).json({ message: "Invalid sort column provided." });
    }
    
    const { fromDate, toDate } = req.query;
    const whereClause = {
      is_active: true,
      is_delete: false,
      ...(search && { en_title: { [Op.like]: `%${search}%` } })
    };

    if (fromDate && toDate) {
      if (new Date(fromDate) > new Date(toDate)) {
        return res.status(400).json({ message: "Invalid date range: 'From' date cannot be after 'To' date." });
      }
      whereClause.date = {
        [Op.between]: [new Date(fromDate), new Date(toDate)],
      };
    } else if (fromDate) {
      whereClause.date = { [Op.gte]: new Date(fromDate) };
    } else if (toDate) {
      whereClause.date = { [Op.lte]: new Date(toDate) };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Notice.findAndCountAll({
      attributes: ['id', 'en_title', 'od_title', 'date', 'doc'], 
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
    });
    
    const noticesWithUrls = rows.map(notice => {
        const data = notice.toJSON();
   
        return { ...data };
    });

    res.status(200).json({
      total: count,
      data: noticesWithUrls,
    });

  } catch (error) {
    console.error("Error fetching public notices:", error);
    res.status(500).json({ message: "Server error." });
  }
};