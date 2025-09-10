import models from "../../models/index.js";
import { log } from "../../services/LogService.js";

const { Tender, Notice, Advertisement, NewsAndEvent, User } = models;

export const getDashboardStats = async (req, res) => {
    console.log(req.useragent);
  try {
    const activeConditions = { where: { is_active: true, is_delete: false } };
    const activeUserConditions = { where: { isActive: true } };
    const newsEvenetActive = { where: { status: "Active" } };

    const [
      tenderCount,
      noticeCount,
      advertisementCount,
      newsEventCount,
      userCount,
    ] = await Promise.all([
      Tender.count(activeConditions),
      Notice.count(activeConditions),
      Advertisement.count(activeConditions),
      NewsAndEvent.count(newsEvenetActive),
      User.count(activeUserConditions),
    ]);

    const noticeAndAdCount = noticeCount + advertisementCount;

    await log({
      req,
      action: "READ",
      page_name: "DASHBOARD",
      target_id: req.params.id,
      description: "READ DASHBOARD",
    });

    res.status(200).json({
      tenderCount,
      noticeAndAdCount,
      newsEventCount,
      userCount,
    });
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching dashboard statistics." });
  }
};
