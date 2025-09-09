import models from "../../models/index.js";
import sequelize from "../../../config/db.js";

const {GalaryCategory, PhotoGallery, VideoGallery} = models

export const getAllPhotos = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "createdAt";
    const sortOrder = req.query.order || "DESC";

    const allowedSortColumns = ["en_title", "od_title", "status", "category_name", "createdAt"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    const whereClause = {
      ...(search && {
        [Op.or]: [
          { en_title: { [Op.like]: `%${search}%` } },
          { od_title: { [Op.like]: `%${search}%` } },
          { '$category.en_category$': { [Op.like]: `%${search}%` } },
        ],
      })
    };

    const order = sortBy === 'category_name'
      ? [[{ model: GalaryCategory, as: 'category' }, 'en_category', sortOrder.toUpperCase()]]
      : [[sortBy, sortOrder.toUpperCase()]];

    const { count, rows } = await PhotoGallery.findAndCountAll({
      where: whereClause,
      include: [{
        model: GalaryCategory,
        as: 'category',
        attributes: [],
      }],
      attributes: {
        include: [
          [sequelize.col('category.en_category'), 'category_name']
        ]
      },
      order,
      limit,
      offset,
      distinct: true,
    });

    const photosWithUrls = rows.map((photo) => {
      const data = photo.toJSON();

      let photo_url = null;
      if (data.phototype === 'file' && data.photofile) {
        const filename = data.photofile.replace(/\\/g, '/');
        photo_url = `${req.protocol}://${req.get('host')}/uploads/photos/${filename}`;
      } else if (data.phototype === 'link' && data.photolink) {
        photo_url = data.photolink;
      }

      return { ...data, photo_url };
    });

    return res.status(200).json({
      total: count,
      data: photosWithUrls,
    });

  } catch (error) {
    console.error('Get Photos Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const getAllVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "createdAt";
    const sortOrder = req.query.order || "DESC";

    const allowedSortColumns = ["en_title", "od_title", "status", "category_name", "createdAt"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    const whereClause = {
      ...(search && {
        [Op.or]: [
          { en_title: { [Op.like]: `%${search}%` } },
          { od_title: { [Op.like]: `%${search}%` } },
          { '$category.en_category$': { [Op.like]: `%${search}%` } },
        ],
      }),
    };

    const order = sortBy === 'category_name'
      ? [[{ model: GalaryCategory, as: 'category' }, 'en_category', sortOrder.toUpperCase()]]
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
          [VideoGallery.sequelize.col('category.en_category'), 'category_name']
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