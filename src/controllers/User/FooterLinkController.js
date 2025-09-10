// src/controllers/User/FooterLinkController.js
import Footerlink from "../../models/Footerlink.js";

export const getLinksByCategory = async (req, res) => {
  const category = req.params.category; // "UsefulLink" or "ImportantLink"

  if (!category) {
    return res.status(400).json({ message: "Category parameter is required" });
  }

  try {
    const links = await Footerlink.findAll({
      where: { linkType: category, status: "Active" },
      attributes: [
        ["en_link_text", "title"], // rename for frontend
        "url",
        "displayOrder"
      ],
      order: [["displayOrder", "ASC"]], // optional: sort by displayOrder
    });

    res.json(links); // returns empty array if nothing matches
  } catch (error) {
    console.error("❌ Error fetching footer links:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
