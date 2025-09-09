import { Op } from "sequelize";
import Scheme from "../../models/Scheme.js";

export const findAllSchemes = async (req, res) => {
  try {
    // Query params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    let sortBy = req.query.sort || 'displayOrder';
    const sortOrder = req.query.order || 'ASC';

    // Secure sort column selection
    const allowedSortColumns = ['id', 'en_title', 'od_title', 'is_active', 'created_at', 'displayOrder'];
    if (!allowedSortColumns.includes(sortBy)) {
      sortBy = 'displayOrder';
    }

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {
      is_delete: false,
      ...(search && {
        [Op.or]: [
          { en_title: { [Op.like]: `%${search}%` } },
          { od_title: { [Op.like]: `%${search}%` } },
        ],
      }),
    };

    // Fetch data with count
    const { count, rows } = await Scheme.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
    });

    // Build full URL for documents
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const schemes = rows.map((scheme) => ({
      id: scheme.id,
      en_title: scheme.en_title,
      od_title: scheme.od_title,
      document: scheme.document
        ? `${baseUrl}/uploads/schemes/${scheme.document}`
        : null,
      is_active: scheme.is_active,
      displayOrder: scheme.displayOrder,
      created_at: scheme.created_at,
      updated_at: scheme.updated_at,
    }));

    return res.json({
      total: count,
      data: schemes,
    });
  } catch (error) {
    console.error("Server Error in findAll Schemes:", error);
    return res.status(500).json({ message: "Server error" });
  }
};