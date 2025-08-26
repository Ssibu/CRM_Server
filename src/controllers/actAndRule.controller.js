import ActAndRule from '../models/actAndRule.model.js';

// Create a new Act/Rule
export const create = async (req, res) => {
  try {
    const { titleEnglish, titleOdia, descriptionEnglish, descriptionOdia } = req.body;
    if (!titleEnglish || !titleOdia || !descriptionEnglish || !descriptionOdia) {
      return res.status(400).send({ message: "All fields are required!" });
    }
    const newActAndRule = await ActAndRule.create(req.body);
    res.status(201).send(newActAndRule);
  } catch (error) {
    res.status(500).send({ message: error.message || "Error creating Act & Rule." });
  }
};

// Retrieve all Act/Rules, sorted by displayOrder
export const findAll = async (req, res) => {
  try {
    const actAndRules = await ActAndRule.findAll({ order: [['displayOrder', 'ASC']] });
    res.status(200).send(actAndRules);
  } catch (error) {
    res.status(500).send({ message: error.message || "Error retrieving Act & Rules." });
  }
};
export const findOne = async (req, res) => {
  const { id } = req.params;
  try {
    const actAndRule = await ActAndRule.findByPk(id);
    if (actAndRule) {
      res.status(200).send(actAndRule);
    } else {
      res.status(404).send({ message: `Cannot find Act & Rule with id=${id}.` });
    }
  } catch (error) {
    res.status(500).send({ message: `Error retrieving Act & Rule with id=${id}.` });
  }
};

// Update an Act/Rule by its ID
export const update = async (req, res) => {
  const { id } = req.params;
  try {
    const [updated] = await ActAndRule.update(req.body, { where: { id: id } });
    if (updated) {
      const updatedRecord = await ActAndRule.findByPk(id);
      res.status(200).send(updatedRecord);
    } else {
      res.status(404).send({ message: `Cannot find Act & Rule with id=${id}.` });
    }
  } catch (error) {
    res.status(500).send({ message: `Error updating Act & Rule with id=${id}.` });
  }
};

// Delete an Act/Rule by its ID
export const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await ActAndRule.destroy({ where: { id: id } });
    if (deleted) {
      res.status(200).send({ message: "Act & Rule was deleted successfully!" });
    } else {
      res.status(404).send({ message: `Cannot find Act & Rule with id=${id}.` });
    }
  } catch (error) {
    res.status(500).send({ message: `Could not delete Act & Rule with id=${id}.` });
  }
};

// Update the display order for all items
export const updateOrder = async (req, res) => {
    const { order } = req.body; // Expects an array of item IDs in the new order
    if (!Array.isArray(order)) {
        return res.status(400).send({ message: "Invalid 'order' data. Must be an array of IDs." });
    }
    try {
        const transaction = await ActAndRule.sequelize.transaction();
        await Promise.all(order.map((id, index) =>
            ActAndRule.update(
                { displayOrder: index },
                { where: { id: id }, transaction }
            )
        ));
        await transaction.commit();
        res.status(200).send({ message: "Order updated successfully." });
    } catch (error) {
        res.status(500).send({ message: "Failed to update order.", error: error.message });
    }
};
export const toggleStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const actAndRule = await ActAndRule.findByPk(id);
    if (!actAndRule) {
      return res.status(404).send({ message: `Cannot find Act & Rule with id=${id}.` });
    }

    // Toggle the status
    const newStatus = actAndRule.status === 'Active' ? 'Inactive' : 'Active';
    
    // Update the record with the new status
    await actAndRule.update({ status: newStatus });
    
    res.status(200).send({ message: `Status updated to ${newStatus} successfully.` });

  } catch (error) {
    res.status(500).send({ message: `Error toggling status for Act & Rule with id=${id}.` });
  }
};