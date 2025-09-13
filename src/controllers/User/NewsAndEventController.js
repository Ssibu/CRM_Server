import models from '../../models/index.js';
import { Op } from 'sequelize';  

import { reformatDate } from '../../utils/reformat-date.js';


const { NewsAndEvent } = models; 

export const findAll = async (req, res) => {
  try {
    // Get query params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
        const search = (req.query.search || "").trim();

    let sortBy = req.query.sort || 'eventDate';
    const sortOrder = req.query.order || 'DESC';

    // Whitelist columns
    const allowedSortColumns = ['id', 'en_title', 'eventDate', 'createdAt', 'displayOrder'];
    if (!allowedSortColumns.includes(sortBy)) {
      sortBy = 'displayOrder';
    }
       const formattedSearch = reformatDate(search) || search;

    // Build search clause (always include status filter)
    const whereClause = {
      status: 'Active', // ✅ only active records
      ...(search && {
        [Op.or]: [
          { en_title: { [Op.like]: `%${search}%` } },
          { od_title: { [Op.like]: `%${search}%` } },
             { eventDate: { [Op.like]: `%${formattedSearch}%` } },
        ],
      }),
    };

    // Add date filter if provided
    if (req.query.fromDate && req.query.toDate) {
      whereClause.eventDate = {
        [Op.between]: [req.query.fromDate, req.query.toDate],
      };
    }

    const offset = (page - 1) * limit;

    // Fetch data
    const { count, rows } = await NewsAndEvent.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
    });

    // Return JSON
    return res.json({
      total: count,
      data: rows,
    });
  } catch (error) {
    console.error("Server Error in findAll NewsAndEvents:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
