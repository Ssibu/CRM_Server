import models from '../../models/index.js';
import { Op } from 'sequelize';   

// Import the correct model
const { BedStrength } = models; 

// This is the only function needed for the user-facing page
export const findAllUser = async (req, res) => {
  try {
    // Standard pagination and search from the frontend hook
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    
    // For the public view, we almost always sort by the manual display order
    const sortBy = 'display_order';
    const sortOrder = 'ASC';

    // This is the most important part for a public controller.
    // We build a query that ONLY finds records that are both active and not deleted.
    const whereClause = {
      is_active: true,
      is_delete: false,
    };

    // If the user provides a search term, we add a bilingual search condition
    if (search) {
      whereClause[Op.or] = [
        { en_title: { [Op.like]: `%${search}%` } },
        { od_title: { [Op.like]: `%${search}%` } },
      ];
    }
    
    const offset = (page - 1) * limit;

    // Use findAndCountAll to get the data and total count for pagination
    const { count, rows } = await BedStrength.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    // Return the data in the format expected by the useServerSideTable hook
    return res.json({
      total: count,
      data: rows,
    });
  } catch (error) {
    console.error("Server Error in findAllUser BedStrengths:", error);
    return res.status(500).json({ message: "Server error" });
  }
};