import Advertisement from "../../models/Advertisement.js";

export const getActiveAdvertisements = async (req, res) => {
  try {
    const ads = await Advertisement.findAll({
      where: {
        is_active: true,
        is_delete: false,
      },
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({ success: true, data: ads });
  } catch (error) {
    console.error("Error fetching advertisements:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
