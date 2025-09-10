import ActAndRule from "../../models/ActAndRules.js";

export const getAllActAndRules = async (req, res) => {
  try {
    const records = await ActAndRule.findAll({
      where: { status: "Active" }, 
      order: [["createdAt", "DESC"]], 
    });

    return res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching Act & Rules:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
