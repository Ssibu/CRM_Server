// import Footerlink from '../models/FooterLink.js';
// export const create = async (req, res) => {
//   try {
//     const { englishLinkText, odiaLinkText, url, linkType } = req.body;
//     if (!englishLinkText || !odiaLinkText || !url) {
//       return res.status(400).send({ message: "Link text and URL are required!" });
//     }
//     const newLink = await Footerlink.create({ englishLinkText, odiaLinkText, url, linkType });
//     res.status(201).send(newLink);
//   } catch (error) {
//     res.status(500).send({ message: error.message || "Error creating footer link." });
//   }
// };
// export const findAll = async (req, res) => {
//   try {
//     const links = await Footerlink.findAll({ order: [['displayOrder', 'ASC']] });
//     res.status(200).send(links);
//   } catch (error) {
//     res.status(500).send({ message: error.message || "Error retrieving footer links." });
//   }
// };
// export const findOne = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const link = await Footerlink.findByPk(id);
//     if (link) {
//       res.status(200).send(link);
//     } else {
//       res.status(404).send({ message: `Cannot find Link with id=${id}.` });
//     }
//   } catch (error) {
//     res.status(500).send({ message: `Error retrieving Link with id=${id}.` });
//   }
// };
// export const update = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const [updated] = await Footerlink.update(req.body, { where: { id: id } });
//     if (updated) {
//       const updatedLink = await Footerlink.findByPk(id);
//       res.status(200).send(updatedLink);
//     } else {
//       res.status(404).send({ message: `Cannot find link with id=${id}.` });
//     }
//   } catch (error) {
//     res.status(500).send({ message: `Error updating link with id=${id}.` });
//   }
// };
// export const destroy = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const deleted = await Footerlink.destroy({ where: { id: id } });
//     if (deleted) {
//       res.status(200).send({ message: "Link was deleted successfully!" });
//     } else {
//       res.status(404).send({ message: `Cannot find link with id=${id}.` });
//     }
//   } catch (error) {
//     res.status(500).send({ message: `Could not delete link with id=${id}.` });
//   }
// };
// export const updateOrder = async (req, res) => {
//     const { order } = req.body;
//     if (!Array.isArray(order)) {
//         return res.status(400).send({ message: "Invalid 'order' data. Must be an array of IDs." });
//     }
//     try {
//         const transaction = await Footerlink.sequelize.transaction();
//         await Promise.all(order.map((id, index) =>
//             Footerlink.update(
//                 { displayOrder: index },
//                 { where: { id: id }, transaction }
//             )
//         ));
//         await transaction.commit();
//         res.status(200).send({ message: "Link order updated successfully." });
//     } catch (error) {
//         res.status(500).send({ message: "Failed to update link order.", error: error.message });
//     }
// };
// export const toggleStatus = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const link = await Footerlink.findByPk(id);
//     if (!link) {
//       return res.status(404).send({ message: `Cannot find Link with id=${id}.` });
//     }
//     const newStatus = link.status === 'Active' ? 'Inactive' : 'Active';
//     await link.update({ status: newStatus });
//     res.status(200).send({ message: `Status updated to ${newStatus} successfully.` });

//   } catch (error) {
//     res.status(500).send({ message: `Error toggling status for Link with id=${id}.` });
//   }
// };



import Footerlink from '../models/FooterLink.js';
import { Op } from 'sequelize';
export const create = async (req, res) => {
  try {
    const { englishLinkText, odiaLinkText, url, linkType } = req.body;
    if (!englishLinkText || !odiaLinkText || !url) {
      return res.status(400).send({ message: "All link text and URL fields are required!" });
    }

    // Validation: Check for duplicates before creating
    const existingLink = await Footerlink.findOne({
      where: {
        [Op.or]: [
          { englishLinkText: englishLinkText },
          { odiaLinkText: odiaLinkText },
          { url: url }
        ]
      }
    });

    if (existingLink) {
      return res.status(409).send({ message: "A footer link with this text or URL already exists." });
    }

    const newLink = await Footerlink.create({ englishLinkText, odiaLinkText, url, linkType });
    res.status(201).send(newLink);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).send({ message: 'This link text or URL already exists.' });
    }
    res.status(500).send({ message: error.message || "Error creating footer link." });
  }
};
export const findAll = async (req, res) => {
  try {
    // Get query params from the hook, with defaults
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    let sortBy = req.query.sort || 'displayOrder';
    const sortOrder = req.query.order || 'ASC';

    // Security: Whitelist sortable columns
    const allowedSortColumns = ['id', 'englishLinkText', 'odiaLinkText', 'linkType', 'status', 'createdAt', 'displayOrder'];
    if (!allowedSortColumns.includes(sortBy)) {
      sortBy = 'displayOrder'; // Fallback to a safe default
    }

    const offset = (page - 1) * limit;

    // Build the search clause
    const whereClause = search ? {
      // is_delete: false, // Add this if your model has a soft delete flag
      [Op.or]: [
        { englishLinkText: { [Op.like]: `%${search}%` } },
        { odiaLinkText: { [Op.like]: `%${search}%` } },
        { linkType: { [Op.like]: `%${search}%` } },
      ],
    } : { /* is_delete: false */ };

    // Use findAndCountAll to get both the data rows and the total count
    const { count, rows } = await Footerlink.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limit,
      offset: offset,
    });

    // Return the data in the format the frontend hook expects
    return res.json({
      total: count,
      data: rows,
    });

  } catch (error) {
    console.error("Server Error in findAll Footerlinks:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
export const findOne = async (req, res) => {
  const { id } = req.params;
  try {
    const link = await Footerlink.findByPk(id);
    if (link) {
      res.status(200).send(link);
    } else {
      res.status(404).send({ message: `Cannot find Link with id=${id}.` });
    }
  } catch (error) {
    res.status(500).send({ message: `Error retrieving Link with id=${id}.` });
  }
};
export const update = async (req, res) => {
  const { id } = req.params;
  const { englishLinkText, odiaLinkText, url } = req.body;

  try {
    // Validation: Check for duplicates on OTHER records before updating
    if (englishLinkText || odiaLinkText || url) {
      const existingLink = await Footerlink.findOne({
        where: {
          [Op.or]: [
            { englishLinkText: englishLinkText || '' },
            { odiaLinkText: odiaLinkText || '' },
            { url: url || '' }
          ],
          id: {
            [Op.ne]: id // Exclude the current link from the check
          }
        }
      });

      if (existingLink) {
        return res.status(409).send({ message: "Another footer link with this text or URL already exists." });
      }
    }

    const [updated] = await Footerlink.update(req.body, { where: { id: id } });
    if (updated) {
      const updatedLink = await Footerlink.findByPk(id);
      res.status(200).send(updatedLink);
    } else {
      res.status(404).send({ message: `Cannot find link with id=${id}.` });
    }
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).send({ message: 'This link text or URL already exists.' });
    }
    res.status(500).send({ message: `Error updating link with id=${id}.` });
  }
};
export const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Footerlink.destroy({ where: { id: id } });
    if (deleted) {
      res.status(200).send({ message: "Link was deleted successfully!" });
    } else {
      res.status(404).send({ message: `Cannot find link with id=${id}.` });
    }
  } catch (error) {
    res.status(500).send({ message: `Could not delete link with id=${id}.` });
  }
};
export const updateOrder = async (req, res) => {
    const { order } = req.body;
    if (!Array.isArray(order)) {
        return res.status(400).send({ message: "Invalid 'order' data. Must be an array of IDs." });
    }
    try {
        const transaction = await Footerlink.sequelize.transaction();
        await Promise.all(order.map((id, index) =>
            Footerlink.update(
                { displayOrder: index },
                { where: { id: id }, transaction }
            )
        ));
        await transaction.commit();
        res.status(200).send({ message: "Link order updated successfully." });
    } catch (error) {
        res.status(500).send({ message: "Failed to update link order.", error: error.message });
    }
};
export const toggleStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const link = await Footerlink.findByPk(id);
    if (!link) {
      return res.status(404).send({ message: `Cannot find Link with id=${id}.` });
    }
    const newStatus = link.status === 'Active' ? 'Inactive' : 'Active';
    await link.update({ status: newStatus });
    res.status(200).send({ message: `Status updated to ${newStatus} successfully.` });

  } catch (error) {
    res.status(500).send({ message: `Error toggling status for Link with id=${id}.` });
  }
};