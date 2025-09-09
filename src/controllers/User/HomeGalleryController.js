


import models from "../../models/index.js"

const {HomeSetting, PhotoGallery, VideoGallery, Holiday} = models

export const getGalleryAndEventsData = async (req, res) => {
  try {
    const homeSettings = await HomeSetting.findOne();

    const photos = await PhotoGallery.findAll({
      where: { status: true },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    const videos = await VideoGallery.findAll({
      where: { status: true },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    const holidays = await Holiday.findAll({
      where: { is_active: true, is_delete: false },
    });

    res.status(200).json({
      homeSettings,
      photos,
      videos,
      holidays,
    });

  } catch (error) {
    console.error("Error fetching gallery and events data:", error);
    res.status(500).json({ message: "Server error while fetching data." });
  }
};