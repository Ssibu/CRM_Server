// import models from '../../models/index.js';
// import { Op } from 'sequelize';

// const reformatDate = (searchString) => {
//   // Return early if searchString is null, undefined, or empty
//   if (!searchString) {
//     return searchString;
//   }
  
//   // Regex to match a complete DD-MM-YYYY date
//   const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
//   const match = searchString.match(dateRegex);

//   // If it's a perfect match, convert it to YYYY-MM-DD.
//   if (match) {
//     return `${match[3]}-${match[2]}-${match[1]}`;
//   }

//   // Otherwise, return the original string for a text-based search.
//   return searchString;
// };



// const { Tender, Corrigendum } = models;

// export const listTenders = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 10;
//     const search = req.query.search || "";
//     const sortBy = req.query.sort || "date";
//     const sortOrder = req.query.order || "DESC";
//     const status = req.query.status || "all"; // all | active | archived

//     const allowedSortColumns = [
//       "en_title",
//       "od_title",
//       "date",
//       "expiry_date",
//       "createdAt"
//     ];
//     if (!allowedSortColumns.includes(sortBy)) {
//       return res.status(400).json({ message: "Invalid sort column" });
//     }

//     const offset = (page - 1) * limit;

//      const formattedSearch = reformatDate(search) || search;

//     // --- Base where clause ---
//     const whereClause = {
//       is_delete: false,
//       is_active: true, // ✅ only active tenders
//       ...(search && {
//         [Op.or]: [
//           { en_title: { [Op.like]: `%${search}%` } },
//           { od_title: { [Op.like]: `%${search}%` } },
//            { date: { [Op.like]: `%${formattedSearch}%` } },
//         ],
//       }),
//     };

//     // --- Archived / Active filter ---
//     const now = new Date();
//     if (status === "archived") {
//       whereClause.expiry_date = { [Op.lt]: now }; // expired
//     } else if (status === "active") {
//       whereClause.expiry_date = { [Op.gte]: now }; // still valid
//     }

//     const { count, rows } = await Tender.findAndCountAll({
//       where: whereClause,
//       order: [[sortBy, sortOrder.toUpperCase()]],
//       limit,
//       offset,
      // include: [
      //   {
      //     model: Corrigendum,
      //     as: "corrigendums", // association alias
      //     where: { is_delete: false },
      //     required: false,
      //     attributes: [
      //       "id",
      //       "en_title",
      //       "od_title",
      //       "date",
      //       "cor_document",
      //       "remarks",
      //       "is_active",
      //     ],
      //     order: [["date", "DESC"]],
      //   },
      // ],
//     });

//     res.status(200).json({
//       total: count,
//       data: rows,
//     });
//   } catch (error) {
//     console.error("Error listing tenders with corrigendums:", error);
//     res.status(500).json({ message: "Server error while listing tenders." });
//   }
// };



import models from '../../models/index.js';
import { Op } from 'sequelize';

import { reformatDate } from '../../utils/reformat-date.js';

const { Tender, Corrigendum } = models;

export const listTenders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = (req.query.search || "").trim();
    const sortBy = req.query.sort || "date";
    const sortOrder = req.query.order || "DESC";
    const status = req.query.status || "all";

    const allowedSortColumns = ["en_title", "od_title", "date", "expiry_date", "createdAt"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    const orClauses = [];
    if (search) {
      orClauses.push({ en_title: { [Op.like]: `%${search}%` } });
      orClauses.push({ od_title: { [Op.like]: `%${search}%` } });

      const formattedDate = reformatDate(search);
      
      if (formattedDate) {
        orClauses.push({ date: formattedDate });
           orClauses.push({ expiry_date: formattedDate });
      }
    }

    const whereClause = {
      is_delete: false,
      is_active: true,
    };

    if (orClauses.length > 0) {
      whereClause[Op.or] = orClauses;
    }

    const now = new Date();
    if (status === "archived") {
      whereClause.expiry_date = { [Op.lt]: now };
    } else if (status === "active") {
      whereClause.expiry_date = { [Op.gte]: now };
    }

    const { count, rows } = await Tender.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
          include: [
        {
          model: Corrigendum,
          as: "corrigendums",
          where: { is_delete: false },
          required: false,
          attributes: [
            "id",
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