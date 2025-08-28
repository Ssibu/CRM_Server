import HomepageBanner from "../models/HomepageBanner.js";
import path from 'path';
import fs from 'fs';

export const uploadHomePageBanner = async (req, res) => {
  try {
    const bannerFile = req.file;

    if (!bannerFile) {
      return res.status(400).json({ error: 'Banner image is required.' });
    }

    // Create a new banner record in the database
    const newBanner = await HomepageBanner.create({
      banner: bannerFile.path, // saved file path (relative to public folder)
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

    return res.status(200).json({
      message: 'Homepage banners fetched successfully',
      banners,
    });
  } catch (error) {
    console.error('Get Banners Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
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

    // If file was uploaded, update banner path
    if (req.file) {
      // Example: req.file.filename = 'banner-123456789.jpg'
      const newBannerPath = `uploads/banners/${req.file.filename}`;

      // Delete old banner file if exists
      if (bannerRecord.banner) {
        const oldFilePath = path.join(process.cwd(), 'public', bannerRecord.banner);
        fs.access(oldFilePath, fs.constants.F_OK, (err) => {
          if (!err) {
            fs.unlink(oldFilePath, (unlinkErr) => {
              if (unlinkErr) console.error('Error deleting old banner:', unlinkErr);
            });
          }
        });
      }

      bannerRecord.banner = newBannerPath;
    }

    // Optionally update other fields if sent in body (like is_active)
    if (req.body.is_active !== undefined) {
      bannerRecord.is_active = req.body.is_active === 'true' || req.body.is_active === true;
    }

    bannerRecord.updated_at = new Date();

    // Save updates
    await bannerRecord.save();

    return res.json({
      message: 'Homepage banner updated successfully',
      banner: bannerRecord,
    });
  } catch (error) {
    console.error('Error updating homepage banner:', error);
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