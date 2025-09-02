import Advertisement from '../models/Advertisement.js';
import path from "path";
import fs from "fs";
import { Op } from "sequelize";

// const deleteFile = (filename) => {
//     if (filename) {
//         const filePath = path.join('public/uploads/advertisements', filename);
//         if (fs.existsSync(filePath)) {
//             fs.unlinkSync(filePath);
//         }
//     }
// };

export const addAdvertisement = async (req, res) => {
  try {
    const { ad_link } = req.body;

    if (!req.files || !req.files.en_adphoto || !req.files.od_adphoto) {
      return res.status(400).json({ message: "Both English and Odia advertisement photos are required." });
    }

    const enAdPhotoFilename = path.basename(req.files.en_adphoto[0].path);
    const odAdPhotoFilename = path.basename(req.files.od_adphoto[0].path);

    const newAdvertisement = await Advertisement.create({
      ad_link,
      en_adphoto: enAdPhotoFilename,
      od_adphoto: odAdPhotoFilename,
    });

    res.status(201).json({ message: "Advertisement created successfully!", data: newAdvertisement });
  } catch (error) {
    console.error("Error creating advertisement:", error);
    res.status(500).json({ message: "Server error while creating advertisement." });
  }
};

export const listAdvertisements = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "created_at"; // Use snake_case to match model
    const sortOrder = req.query.order || "DESC";

    const allowedSortColumns = ["ad_link", "created_at"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;
    const whereClause = { is_delete: false, ...(search && { ad_link: { [Op.like]: `%${search}%` } }) };

    const { count, rows } = await Advertisement.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
    });

    res.status(200).json({ total: count, data: rows });
  } catch (error) {
    console.error("Error listing advertisements:", error);
    res.status(500).json({ message: "Server error while listing advertisements." });
  }
};

export const getAdvertisementById = async (req, res) => {
    try {
        const { id } = req.params;
        const ad = await Advertisement.findByPk(id);
        if (!ad || ad.is_delete) {
            return res.status(404).json({ message: "Advertisement not found." });
        }
        res.status(200).json(ad);
    } catch (error) {
        res.status(500).json({ message: "Server error while fetching advertisement." });
    }
};

export const updateAdvertisement = async (req, res) => {
    try {
        const { id } = req.params;
        const ad = await Advertisement.findByPk(id);
        if (!ad) {
            return res.status(404).json({ message: "Advertisement not found." });
        }

        const { ad_link, is_active } = req.body;

        // Handle English photo replacement
        if (req.files && req.files.en_adphoto) {
            // deleteFile(ad.en_adphoto); 
            ad.en_adphoto = path.basename(req.files.en_adphoto[0].path);
        }

        // Handle Odia photo replacement
        if (req.files && req.files.od_adphoto) {
            // deleteFile(ad.od_adphoto); 
            ad.od_adphoto = path.basename(req.files.od_adphoto[0].path);
        }

        ad.ad_link = ad_link || ad.ad_link;
        ad.is_active = is_active !== undefined ? is_active : ad.is_active;

        await ad.save();
        res.status(200).json({ message: "Advertisement updated successfully!", data: ad });
    } catch (error) {
        res.status(500).json({ message: "Server error while updating advertisement." });
    }
};

export const toggleAdvertisementStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const ad = await Advertisement.findByPk(id);
        if (!ad) {
            return res.status(404).json({ message: "Advertisement not found." });
        }
        ad.is_active = !ad.is_active;
        await ad.save();
        res.status(200).json({ message: `Advertisement has been ${ad.is_active ? "activated" : "deactivated"}.`, data: ad });
    } catch (error) {
        res.status(500).json({ message: "Server error while toggling status." });
    }
};