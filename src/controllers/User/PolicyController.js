import models from '../../models/index.js';
import { Op } from 'sequelize';   

const { Policy } = models; 

export const findAllUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    
    // For users, we probably just sort by displayOrder
    const sortBy = 'displayOrder';
    const sortOrder = 'ASC';

    const whereClause = {
      is_active: true,  // <-- IMPORTANT: Only show active policies
      is_delete: false, // <-- IMPORTANT: Only show non-deleted policies
    };

    if (search) {
      whereClause[Op.or] = [
        { en_title: { [Op.like]: `%${search}%` } },
        { od_title: { [Op.like]: `%${search}%` } },
      ];
    }
    
    const offset = (page - 1) * limit;

    const { count, rows } = await Policy.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return res.json({
      total: count,
      data: rows,
    });
  } catch (error) {
    console.error("Server Error in findAllUser Policies:", error);
    return res.status(500).json({ message: "Server error" });
  }
};