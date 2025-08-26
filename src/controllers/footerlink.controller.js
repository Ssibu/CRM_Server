import Footerlink from '../models/footerlink.model.js';

// Create a new Footer Link
export const create = async (req, res) => {
  try {
    const { englishLinkText, odiaLinkText, url, linkType } = req.body;
    if (!englishLinkText || !odiaLinkText || !url) {
      return res.status(400).send({ message: "Link text and URL are required!" });
    }
    const newLink = await Footerlink.create({ englishLinkText, odiaLinkText, url, linkType });
    res.status(201).send(newLink);
  } catch (error) {
    res.status(500).send({ message: error.message || "Error creating footer link." });
  }
};

// Retrieve all Footer Links, sorted by displayOrder
export const findAll = async (req, res) => {
  try {
    const links = await Footerlink.findAll({ order: [['displayOrder', 'ASC']] });
    res.status(200).send(links);
  } catch (error) {
    res.status(500).send({ message: error.message || "Error retrieving footer links." });
  }
};

// --- ADDED: Find a single Footer Link by ID ---
// This function is required for the Edit page to fetch existing data.
export const findOne = async (req, res) => {
  const { id } = req.params;
  try {
    const link = await Footerlink.findByPk(id);
    if (link) {
      res.status(200).send(link);
    } else {
      res.status(404).send({ message: `Cannot find Link with id=${id}.` });
    }
  } catch (error) {
    res.status(500).send({ message: `Error retrieving Link with id=${id}.` });
  }
};

// Update a Footer Link by its ID
export const update = async (req, res) => {
  const { id } = req.params;
  try {
    const [updated] = await Footerlink.update(req.body, { where: { id: id } });
    if (updated) {
      const updatedLink = await Footerlink.findByPk(id);
      res.status(200).send(updatedLink);
    } else {
      res.status(404).send({ message: `Cannot find link with id=${id}.` });
    }
  } catch (error) {
    res.status(500).send({ message: `Error updating link with id=${id}.` });
  }
};

// Delete a Footer Link by its ID
export const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Footerlink.destroy({ where: { id: id } });
    if (deleted) {
      res.status(200).send({ message: "Link was deleted successfully!" });
    } else {
      res.status(404).send({ message: `Cannot find link with id=${id}.` });
    }
  } catch (error) {
    res.status(500).send({ message: `Could not delete link with id=${id}.` });
  }
};

// Update the display order for all links
export const updateOrder = async (req, res) => {
    const { order } = req.body;
    if (!Array.isArray(order)) {
        return res.status(400).send({ message: "Invalid 'order' data. Must be an array of IDs." });
    }
    try {
        const transaction = await Footerlink.sequelize.transaction();
        await Promise.all(order.map((id, index) =>
            Footerlink.update(
                { displayOrder: index },
                { where: { id: id }, transaction }
            )
        ));
        await transaction.commit();
        res.status(200).send({ message: "Link order updated successfully." });
    } catch (error) {
        res.status(500).send({ message: "Failed to update link order.", error: error.message });
    }
};
export const toggleStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const link = await Footerlink.findByPk(id);
    if (!link) {
      return res.status(404).send({ message: `Cannot find Link with id=${id}.` });
    }

    // Toggle the status
    const newStatus = link.status === 'Active' ? 'Inactive' : 'Active';
    
    // Update the record with the new status
    await link.update({ status: newStatus });
    
    res.status(200).send({ message: `Status updated to ${newStatus} successfully.` });

  } catch (error) {
    res.status(500).send({ message: `Error toggling status for Link with id=${id}.` });
  }
};