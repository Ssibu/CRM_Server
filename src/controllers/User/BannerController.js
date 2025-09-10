import HomepageBanner from "../../models/HomepageBanner.js";

export const getAllHomePageBanners = async (req, res) => {
  try {
    // Fetch only active banners
    const banners = await HomepageBanner.findAll({
      where: {
        is_active: true,
      },
    });

    const bannersWithUrls = banners.map((banner) => {
      const bannerData = banner.toJSON();

      // Normalize slashes in filename
      const filename = (bannerData.banner || "").replace(/\\/g, "/");

      const imageUrl = filename
        ? `${req.protocol}://${req.get("host")}/uploads/banners/${filename}`
        : null;

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