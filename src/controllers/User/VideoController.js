import GalaryCategory from "../../models/GalleryCategory.js";
import VideoGallery from "../../models/VideoGallery.js";

import { Op } from 'sequelize'; // ensure this is imported



// export const getAllVideos = async (req, res) => {
//   try {
//     const category_id = req.query.category_id || null; // filter by category
//     const search = req.query.search || "";
//     const sortBy = req.query.sort || "createdAt";
//     const sortOrder = req.query.order || "DESC";

//     const allowedSortColumns = ["en_title", "od_title", "status", "category_name", "createdAt"];
//     if (!allowedSortColumns.includes(sortBy)) {
//       return res.status(400).json({ message: "Invalid sort column" });
//     }

//     const whereClause = {
//       ...(category_id && { category_id }),
//       ...(search && {
//         [Op.or]: [
//           { en_title: { [Op.like]: `%${search}%` } },
//           { od_title: { [Op.like]: `%${search}%` } },
//           { '$category.en_category$': { [Op.like]: `%${search}%` } },
//         ],
//       }),
//     };

//     const order = sortBy === 'category_name'
//       ? [[{ model: GalaryCategory, as: 'category' }, 'en_category', sortOrder.toUpperCase()]]
//       : [[sortBy, sortOrder.toUpperCase()]];

//     const rows = await VideoGallery.findAll({
//       where: whereClause,
//       include: [{
//         model: GalaryCategory,
//         as: 'category',
//         attributes: [],
//       }],
//       attributes: {
//         include: [
//           [VideoGallery.sequelize.col('category.en_category'), 'category_name']
//         ]
//       },
//       order,
//       distinct: true,
//     });

//     const videosWithUrls = rows.map((video) => {
//       const data = video.toJSON();
//       let video_url = null;
//       if (data.videotype === 'file' && data.videofile) {
//         const filename = data.videofile.replace(/\\/g, '/');
//         video_url = `${req.protocol}://${req.get('host')}/uploads/videos/${filename}`;
//       } else if (data.videotype === 'link' && data.videolink) {
//         video_url = data.videolink;
//       }
//       return { ...data, video_url };
//     });

//     res.status(200).json({ total: videosWithUrls.length, data: videosWithUrls });

//   } catch (error) {
//     console.error('Get Videos Error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
export const getAllVideos = async (req, res) => {
  try {
    const category_id = req.query.category_id || null; // filter by category
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

    const rows = await VideoGallery.findAll({
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

    res.status(200).json({ total: videosWithUrls.length, data: videosWithUrls });

  } catch (error) {
    console.error('Get Videos Error:', error);
    res.status(500).json({ message: 'Internal server error' });
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