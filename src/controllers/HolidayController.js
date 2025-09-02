import Holiday from '../models/Holiday.js';
import { Op } from "sequelize";

export const addHoliday = async (req, res) => {
  try {
    const { holiday_date, name, type } = req.body;

    if (!holiday_date || !name || !type) {
      return res.status(400).json({ message: "Holiday date, name, and type are required." });
    }

    const newHoliday = await Holiday.create({ holiday_date, name, type });

    res.status(201).json({ message: "Holiday created successfully!", data: newHoliday });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: "A holiday for this date already exists." });
    }
    console.error("Error creating holiday:", error);
    res.status(500).json({ message: "Server error while creating holiday." });
  }
};

export const listHolidays = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "holiday_date";
    const sortOrder = req.query.order || "ASC";

    const allowedSortColumns = ["holiday_date", "name", "type", "createdAt"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;
    const whereClause = { is_delete: false, ...(search && { name: { [Op.like]: `%${search}%` } }) };

    const { count, rows } = await Holiday.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
    });

    res.status(200).json({ total: count, data: rows });
  } catch (error) {
    console.error("Error listing holidays:", error);
    res.status(500).json({ message: "Server error while listing holidays." });
  }
};

export const getHolidayById = async (req, res) => {
    try {
        const { id } = req.params;
        const holiday = await Holiday.findByPk(id);
        if (!holiday || holiday.is_delete) {
            return res.status(404).json({ message: "Holiday not found." });
        }
        res.status(200).json(holiday);
    } catch (error) {
        res.status(500).json({ message: "Server error while fetching holiday." });
    }
};

export const updateHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const holiday = await Holiday.findByPk(id);
        if (!holiday) {
            return res.status(404).json({ message: "Holiday not found." });
        }

        const { holiday_date, name, type, is_active } = req.body;
        
        holiday.holiday_date = holiday_date || holiday.holiday_date;
        holiday.name = name || holiday.name;
        holiday.type = type || holiday.type;
        holiday.is_active = is_active !== undefined ? is_active : holiday.is_active;

        await holiday.save();
        res.status(200).json({ message: "Holiday updated successfully!", data: holiday });
    } catch (error) {
         if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: "A holiday for this date already exists." });
        }
        res.status(500).json({ message: "Server error while updating holiday." });
    }
};

export const toggleHolidayStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const holiday = await Holiday.findByPk(id);
        if (!holiday) {
            return res.status(404).json({ message: "Holiday not found." });
        }
        holiday.is_active = !holiday.is_active;
        await holiday.save();
        res.status(200).json({ message: `Holiday has been ${holiday.is_active ? "activated" : "deactivated"}.`, data: holiday });
    } catch (error) {
        res.status(500).json({ message: "Server error while toggling status." });
    }
};

export const deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const holiday = await Holiday.findByPk(id);
        if (!holiday) {
            return res.status(404).json({ message: "Holiday not found." });
        }
        holiday.is_delete = true;
        await holiday.save();
        res.status(200).json({ message: `Holiday has been deleted.` });
    } catch (error) {
        res.status(500).json({ message: "Server error while deleting holiday." });
    }
};