import models from "../../models/index.js";

const { Tender, Notice, ActAndRule, NewsAndEvent } = models;

export const getHomeBoardData = async (req, res) => {
  try {
    const latestTender = await Tender.findAll({
      where: {
        is_active: true,
        is_delete: false,
      },
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    const latestNotice = await Notice.findAll({
      where: {
        is_active: true,
        is_delete: false,
      },
      order: [["created_at", "DESC"]],
      limit: 5,
    });

    const latestActAndRule = await ActAndRule.findAll({
      where: {
        status: "Active",
      },
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    const latestNewsAndEvent = await NewsAndEvent.findAll({
      where: {
        status: "Active",
      },
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    res.json({
      tender: latestTender,
      notice: latestNotice,
      actAndRule: latestActAndRule,
      newsAndEvent: latestNewsAndEvent,
    });
  } catch (error) {
    console.error("Error fetching latest data:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
