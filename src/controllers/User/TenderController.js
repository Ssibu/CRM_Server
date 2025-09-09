import models from '../../models/index.js';
import { Op } from 'sequelize';

const { Tender, Corrigendum } = models;

export const listTenders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "createdAt";
    const sortOrder = req.query.order || "DESC";
    const status = req.query.status || "all"; // all | active | archived

    const allowedSortColumns = [
      "en_title",
      "od_title",
      "date",
      "expiry_date",
      "createdAt"
    ];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    // --- Base where clause ---
    const whereClause = {
      is_delete: false,
      is_active: true, // ✅ only active tenders
      ...(search && {
        [Op.or]: [
          { en_title: { [Op.like]: `%${search}%` } },
          { od_title: { [Op.like]: `%${search}%` } },
        ],
      }),
    };

    // --- Archived / Active filter ---
    const now = new Date();
    if (status === "archived") {
      whereClause.expiry_date = { [Op.lt]: now }; // expired
    } else if (status === "active") {
      whereClause.expiry_date = { [Op.gte]: now }; // still valid
    }

    const { count, rows } = await Tender.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
      include: [
        {
          model: Corrigendum,
          as: "corrigendums", // association alias
          where: { is_delete: false },
          required: false,
          attributes: [
            "id",
            "en_title",
            "od_title",
            "date",
            "cor_document",
            "remarks",
            "is_active",
          ],
          order: [["date", "DESC"]],
        },
      ],
    });

    res.status(200).json({
      total: count,
      data: rows,
    });
  } catch (error) {
    console.error("Error listing tenders with corrigendums:", error);
    res.status(500).json({ message: "Server error while listing tenders." });
  }
};
