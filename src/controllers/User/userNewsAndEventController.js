import NewsAndEvent from '../../models/NewsAndEvent.js';
import { Op } from 'sequelize';

// ✅ USER: Public GET function for fetching only active news/events
export const getAllActiveEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    // USER KE LIYE: STRICT FILTER - ONLY ACTIVE EVENTS
    const whereClause = {
      status: 'Active' 
    };

    if (search) {
      whereClause[Op.or] = [
        { en_title: { [Op.like]: `%${search}%` } },
        { od_title: { [Op.like]: `%${search}%` } }
      ];
    }

    console.log('🎯 USER Database Query Filter:', whereClause);

    const { count, rows } = await NewsAndEvent.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['eventDate', 'DESC']],
    });

    console.log(`✅ USER Found ${count} ACTIVE events`);

    // Debugging ke liye har event ka status check karein
    rows.forEach(event => {
      console.log(`Event ID: ${event.id}, Title: ${event.en_title}, Status: ${event.status}`);
    });

    const totalPages = Math.ceil(count / limit);

    const transformed = rows.map(event => {
      const obj = event.toJSON();
      obj.documentUrl = obj.document
        ? `/uploads/events/${obj.document}`
        : null;
      return obj;
    });

    // Frontend compatible response format
    res.status(200).json({
      success: true,
      data: transformed,
      total: count,
      totalPages,
      currentPage: page
    });

  } catch (error) {
    console.error("❌ Error fetching active news/events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active events",
      error: error.message
    });
  }
};