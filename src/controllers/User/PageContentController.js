import models from "../../models/index.js";

const { Menu, SubMenu, SubSubMenu } = models;

export const getContentBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const requiredAttributes = [
      "en_title",
      "od_title",
      "en_description",
      "od_description",
      "image_url",
    ];

    let content = await Menu.findOne({
      where: { slug },
      attributes: requiredAttributes,
    });

    if (!content) {
      content = await SubMenu.findOne({
        where: { slug },
        attributes: requiredAttributes,
      });
    }

    if (!content) {
      content = await SubSubMenu.findOne({
        where: { slug },
        attributes: requiredAttributes,
      });
    }

    if (content) {
      return res.status(200).json(content);
    } else {
      return res.status(404).json({ message: "Content not found." });
    }
  } catch (error) {
    console.error("Error fetching content by slug:", error);
    res.status(500).json({ message: "Failed to fetch content." });
  }
};
