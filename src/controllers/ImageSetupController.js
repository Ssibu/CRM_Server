import HomepageBanner from "../models/HomepageBanner.js";
import path from 'path';
import fs from 'fs';

export const uploadHomePageBanner = async (req, res) => {
  try {
    const bannerFile = req.file;

    if (!bannerFile) {
      return res.status(400).json({ error: 'Banner image is required.' });
    }

    // Extract only the filename from bannerFile.path
    // bannerFile.path example: "uploads/default/banner-12345-1598745123.jpeg"
    const filename = path.basename(bannerFile.path);

    // Store only the filename in DB
    const newBanner = await HomepageBanner.create({
      banner: filename,
      is_active: true,
    });

    return res.status(201).json({
      message: 'Homepage banner uploaded successfully',
      banner: newBanner,
    });
  } catch (error) {
    console.error('Upload Banner Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
export const getAllHomePageBanners = async (req, res) => {
  try {
    const banners = await HomepageBanner.findAll();

    const bannersWithUrls = banners.map((banner) => {
      const bannerData = banner.toJSON();

      // Get the filename from DB
      const filename = (bannerData.banner || "").replace(/\\/g, "/"); // Normalize slashes

      const imageUrl = filename
        ? `${req.protocol}://${req.get("host")}/uploads/banners/${filename}`
        : null; // or fallback URL

      return {
        ...bannerData,
        image_url: imageUrl,
      };
    });

    return res.status(200).json({
      message: "Homepage banners fetched successfully",
      banners: bannersWithUrls,
    });
  } catch (error) {
    console.error("Get Banners Error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
export const updateHomePageBanner = async (req, res) => {
  const bannerId = req.params.id;

  try {
    // Find existing banner by ID
    const bannerRecord = await HomepageBanner.findByPk(bannerId);

    if (!bannerRecord) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    // If a new file was uploaded, handle replacement
    if (req.file) {
      const newFilename = path.basename(req.file.path); // Extract filename only

      // Delete old image file from disk (if exists)
      if (bannerRecord.banner) {
        const oldFilePath = path.join(
          process.cwd(),
          'public',
          'uploads',
          'banners',
          bannerRecord.banner
        );

        fs.access(oldFilePath, fs.constants.F_OK, (err) => {
          if (!err) {
            fs.unlink(oldFilePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error('Error deleting old banner:', unlinkErr);
              }
            });
          }
        });
      }

      // Update with new image filename
      bannerRecord.banner = newFilename;
    }

    // Optionally update is_active if sent
    if (req.body.is_active !== undefined) {
      bannerRecord.is_active =
        req.body.is_active === 'true' || req.body.is_active === true;
    }

    // Update timestamp manually if needed (Sequelize usually does this)
    bannerRecord.updated_at = new Date();

    await bannerRecord.save();

    return res.status(200).json({
      message: 'Homepage banner updated successfully',
      banner: bannerRecord,
    });
  } catch (error) {
    console.error('Error updating homepage banner:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
export const getHomePageBannerById = async (req, res) => {
  const { id } = req.params;

  try {
    const banner = await HomepageBanner.findByPk(id);

    if (!banner) {
      return res.status(404).json({ message: 'Homepage banner not found' });
    }

    const bannerData = banner.toJSON();

    // Normalize and construct full image URL
    const filename = (bannerData.banner || "").replace(/\\/g, "/");

    const imageUrl = filename
      ? `${req.protocol}://${req.get("host")}/uploads/banners/${filename}`
      : null;

    return res.status(200).json({
      message: 'Homepage banner fetched successfully',
      banner: {
        ...bannerData,
        image_url: imageUrl,
      },
    });
  } catch (error) {
    console.error('Error fetching homepage banner by ID:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
export const toggleHomepageBannerStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const banner = await HomepageBanner.findByPk(id);

    if (!banner) {
      return res.status(404).json({ message: 'Homepage banner not found' });
    }

    banner.is_active = !banner.is_active; // Toggle status
    await banner.save();

    res.status(200).json({
      message: `Homepage banner status changed to ${banner.is_active ? 'Active' : 'Inactive'}`,
      banner,
    });
  } catch (error) {
    console.error('Error toggling homepage banner status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



