import GalaryCategory from "../../models/GalleryCategory.js";
import VideoGallery from "../../models/VideoGallery.js";

import { Op } from 'sequelize'; // ensure this is imported

export const getAllVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "createdAt";
    const sortOrder = req.query.order || "DESC";

    const allowedSortColumns = ["title_en", "title_od", "status", "category_name", "createdAt"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    // Add status:true filter here
    const whereClause = {
      status: true,
      ...(search && {
        [Op.or]: [
          { title_en: { [Op.like]: `%${search}%` } },
          { title_od: { [Op.like]: `%${search}%` } },
          { '$category.category_en$': { [Op.like]: `%${search}%` } },
        ],
      }),
    };

    const order = sortBy === 'category_name'
      ? [[{ model: GalaryCategory, as: 'category' }, 'category_en', sortOrder.toUpperCase()]]
      : [[sortBy, sortOrder.toUpperCase()]];

    const { count, rows } = await VideoGallery.findAndCountAll({
      where: whereClause,
      include: [{
        model: GalaryCategory,
        as: 'category',
        attributes: [],
      }],
      attributes: {
        include: [
          [VideoGallery.sequelize.col('category.category_en'), 'category_name']
        ]
      },
      order,
      limit,
      offset,
      distinct: true,
    });

    const videosWithUrls = rows.map((video) => {
      const data = video.toJSON();

      let video_url = null;
      if (data.videotype === 'file' && data.videofile) {
        const filename = data.videofile.replace(/\\/g, '/');
        video_url = `${req.protocol}://${req.get('host')}/uploads/videos/${filename}`;
      } else if (data.videotype === 'link' && data.videolink) {
        video_url = data.videolink;
      }

      return { ...data, video_url };
    });

    res.status(200).json({
      total: count,
      data: videosWithUrls,
    });
  } catch (error) {
    console.error('Get Videos Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
