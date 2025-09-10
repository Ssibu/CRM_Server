import models from "../../models/index.js";
import sequelize from "../../../config/db.js";

const {GalaryCategory, PhotoGallery, VideoGallery} = models

// export const getAllCategories = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 10;
//     const search = req.query.search || "";
//     const sortBy = req.query.sort || "createdAt";
//     const sortOrder = req.query.order || "DESC";

//     const allowedSortColumns = ["en_category", "od_category", "category_type", "status", "createdAt"];
//     if (!allowedSortColumns.includes(sortBy)) {
//       return res.status(400).json({ message: "Invalid sort column" });
//     }

//     const offset = (page - 1) * limit;

//     const whereClause = {
//       ...(search && {
//         [Op.or]: [
//           { en_category: { [Op.like]: `%${search}%` } },
//           { od_category: { [Op.like]: `%${search}%` } },
//           { category_type: { [Op.like]: `%${search}%` } },
//         ],
//       })
//     };

//     const { count, rows } = await GalaryCategory.findAndCountAll({
//       where: whereClause,
//       order: [[sortBy, sortOrder.toUpperCase()]],
//       limit,
//       offset,
//     });

//     // Process rows to add full thumbnail URLs
//     const categoriesWithUrls = rows.map((cat) => {
//       const data = cat.toJSON();
//       const filename = (data.thumbnail || "").replace(/\\/g, "/");
//       const imageUrl = filename ? `${req.protocol}://${req.get('host')}/uploads/categories/${filename}` : null;
//       return { ...data, thumbnail_url: imageUrl };
//     });

//     // Return data in the standard format for our hook
//     res.status(200).json({
//       total: count,
//       data: categoriesWithUrls,
//     });

//   } catch (error) {
//     console.error('Get Categories Error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
export const getAllPhotosWithoutPagination = async (req, res) => {
  try {
    const category_id = req.query.category_id || null;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "createdAt";
    const sortOrder = req.query.order || "DESC";

    const allowedSortColumns = ["en_title", "od_title", "status", "category_name", "createdAt"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const whereClause = {
      [sequelize.col("PhotoGallery.status")]: true, // only active photos
      ...(category_id && { category_id }),
      ...(search && {
        [Op.or]: [
          { en_title: { [Op.like]: `%${search}%` } },
          { od_title: { [Op.like]: `%${search}%` } },
          { "$category.en_category$": { [Op.like]: `%${search}%` } },
        ],
      }),
    };

    const order = sortBy === 'category_name'
      ? [[{ model: GalaryCategory, as: 'category' }, 'en_category', sortOrder.toUpperCase()]]
      : [[sortBy, sortOrder.toUpperCase()]];

    const photos = await PhotoGallery.findAll({
      where: whereClause,
      include: [{
        model: GalaryCategory,
        as: "category",
        attributes: [],
        where: { [sequelize.col("category.status")]: true }, // only active categories
      }],
      attributes: {
        include: [[sequelize.col("category.en_category"), "category_name"]],
      },
      order,
      distinct: true,
    });

    const photosWithUrls = photos.map((photo) => {
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

    res.status(200).json({ total: photosWithUrls.length, data: photosWithUrls });

  } catch (error) {
    console.error('Get Photos Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
export const getAllVideosWithoutPagination = async (req, res) => {
  try {
    const category_id = req.query.category_id || null;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "createdAt";
    const sortOrder = req.query.order || "DESC";

    const allowedSortColumns = ["en_title", "od_title", "status", "category_name", "createdAt"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const whereClause = {
      ...(category_id && { category_id }),
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

    const videos = await VideoGallery.findAll({
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
      distinct: true,
    });

    const videosWithUrls = videos.map(video => {
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

    res.status(200).json({ total: videosWithUrls.length, data: videosWithUrls });

  } catch (error) {
    console.error('Get All Videos Error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
export const getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const categoryType = req.query.type || null; // <- NEW: type filter
    const sortBy = req.query.sort || "createdAt";
    const sortOrder = req.query.order || "DESC";

    const allowedSortColumns = ["en_category", "od_category", "category_type", "status", "createdAt"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    const whereClause = {
      ...(categoryType && { category_type: categoryType }), // <- filter by type
      ...(search && {
        [Op.or]: [
          { en_category: { [Op.like]: `%${search}%` } },
          { od_category: { [Op.like]: `%${search}%` } },
          { category_type: { [Op.like]: `%${search}%` } },
        ],
      }),
    };

    const { count, rows } = await GalaryCategory.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
    });

    const categoriesWithUrls = rows.map((cat) => {
      const data = cat.toJSON();
      const filename = (data.thumbnail || "").replace(/\\/g, "/");
      const imageUrl = filename ? `${req.protocol}://${req.get('host')}/uploads/categories/${filename}` : null;
      return { ...data, thumbnail_url: imageUrl };
    });

    res.status(200).json({
      total: count,
      data: categoriesWithUrls,
    });

  } catch (error) {
    console.error('Get Categories Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllPhotos = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "createdAt";
    const sortOrder = req.query.order || "DESC";
    const category_id = req.query.category_id || null; 
    const allowedSortColumns = ["en_title", "od_title", "status", "category_name", "createdAt"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    const whereClause = {
         ...(category_id && { category_id }),
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
    const category_id = req.query.category_id || null; // <-- important
    const search = req.query.search || "";
    const sortBy = req.query.sort || "createdAt";
    const sortOrder = req.query.order || "DESC";

    const allowedSortColumns = ["en_title", "od_title", "status", "category_name", "createdAt"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    const whereClause = {
      ...(category_id && { category_id }), // <-- filter by category
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

    res.status(200).json({ total: count, data: videosWithUrls });
  } catch (error) {
    console.error('Get Videos Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

