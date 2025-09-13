
import models from "../../models/index.js";
import { Op } from "sequelize";
import { log } from "../../services/LogService.js";

const { Log, User } = models;

export const listLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    let sortBy = req.query.sort || "created_at";
    const sortOrder = req.query.order || "DESC";

    // const allowedSortColumns = [
    //   "action",
    //   "page_name",
    //   "createdAt",
    //   "user_name",
    // ];
    // if (!allowedSortColumns.includes(sortBy)) {
    //   sortBy = "created_at";
    // }

    const sortByUser = sortBy === "user_name";
    const dbSortBy = sortByUser ? "created_at" : sortBy;
    const offset = (page - 1) * limit;

    const whereClause = {
      [Op.or]: [
        { action: { [Op.like]: `%${search}%` } },
        { page_name: { [Op.like]: `%${search}%` } },
          { target: { [Op.like]: `%${search}%` } },
        { ip: { [Op.like]: `%${search}%` } },
        { os: { [Op.like]: `%${search}%` } },
        { browser: { [Op.like]: `%${search}%` } },
        { platform: { [Op.like]: `%${search}%` } },
      ],
    };

    if (search) {
      const matchingUsers = await User.findAll({
        where: { name: { [Op.like]: `%${search}%` } },
        attributes: ["id"],
      });
      const matchingUserIds = matchingUsers.map((u) => u.id);

      if (matchingUserIds.length > 0) {
        whereClause[Op.or].push({ user_id: { [Op.in]: matchingUserIds } });
      }
    }

    const { count, rows: logs } = await Log.findAndCountAll({
      where: whereClause,
      order: [[dbSortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
    });

    const userIds = [...new Set(logs.map((log) => log.user_id))];

    let userMap = {};
    if (userIds.length > 0) {
      const users = await User.findAll({
        where: { id: userIds },
        attributes: ["id", "name"],
      });
      userMap = users.reduce((map, user) => {
        map[user.id] = user.name;
        return map;
      }, {});
    }

    let dataWithUserNames = logs.map((log) => {
      const logJSON = log.toJSON();
      return {
        ...logJSON,
        user_name: userMap[logJSON.user_id] || "Unknown User",
         description: `${log.action} ${ log.target === null ? "" : log.target } in ${log.page_name} page.`
      };
    });

    if (sortByUser) {
      dataWithUserNames.sort((a, b) => {
        const nameA = a.user_name.toLowerCase();
        const nameB = b.user_name.toLowerCase();
        return sortOrder.toUpperCase() === "ASC"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
    }
       await log({
              req,
              action: "READ",
              page_name: "LOG RECORDS",
            });

    res.status(200).json({
      total: count,
      data: dataWithUserNames,
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ message: "Server error while fetching logs." });
  }
};
