// import models from "../../models/index.js";
// import { Op } from "sequelize";

// const { BedStrength, SubMenu } = models;

// export const findAllUser = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 10;
//     const search = req.query.search || "";

//     const sortBy = "display_order";
//     const sortOrder = "ASC";

//     const whereClause = {
//       is_active: true,
//       is_delete: false,
//     };

//     if (search) {
//       whereClause[Op.or] = [
//         { en_title: { [Op.like]: `%${search}%` } },
//         { od_title: { [Op.like]: `%${search}%` } },
//       ];
//     }

//     const offset = (page - 1) * limit;

//     const { count, rows } = await BedStrength.findAndCountAll({
//       where: whereClause,
//       order: [[sortBy, sortOrder]],
//       limit,
//       offset,
//     });

//     return res.json({
//       total: count,
//       data: rows,
//     });
//   } catch (error) {
//     console.error("Server Error in findAllUser BedStrengths:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };



import models from "../../models/index.js";
import { Op } from "sequelize";

const { BedStrength, SubMenu } = models;

export const findAllUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";

    const sortBy = "display_order";
    const sortOrder = "ASC";

    const whereClause = {
      is_active: true,
      is_delete: false,
    };

    if (search) {
      whereClause[Op.or] = [
        { en_title: { [Op.like]: `%${search}%` } },
        { od_title: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    // 1️⃣ Fetch BedStrength data
    const { count, rows } = await BedStrength.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    // 2️⃣ Fetch meta data from SubMenu where slug = "bed-strength"
    const subMenuMeta = await SubMenu.findOne({
      where: { slug: "bed-strength" },
      attributes: ["meta_title", "meta_keyword", "meta_description"],
    });

    // 3️⃣ Send response with both data + meta
    return res.json({
      total: count,
      data: rows,
      meta: subMenuMeta || {}, // ✅ meta info here
    });
  } catch (error) {
    console.error("Server Error in findAllUser BedStrengths:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
