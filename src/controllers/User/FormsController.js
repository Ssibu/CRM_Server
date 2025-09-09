import { Op } from 'sequelize';
import Form from '../../models/Form.js'; // Adjust the path as needed

export const getAllForms = async (req, res) => {
  try {
    // Pagination params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Sorting params with validation
    let sortBy = req.query.sort || 'display_order'; // changed to 'sort' from 'sortBy'
    const allowedSortFields = ['id', 'en_title', 'od_title', 'is_active', 'created_at', 'display_order'];
    if (!allowedSortFields.includes(sortBy)) {
      sortBy = 'display_order';
    }

    // Sorting order
    const order = req.query.order === 'desc' ? 'DESC' : 'ASC';

    // Searching param
    const search = req.query.search || '';

    // Build where clause
    const whereClause = {
      is_active: true,
      is_delete: false,
      ...(search && {
        [Op.or]: [
          { en_title: { [Op.like]: `%${search}%` } },
          { od_title: { [Op.like]: `%${search}%` } },
        ],
      }),
    };

    // Fetch data and count
    const { count, rows } = await Form.findAndCountAll({
      where: whereClause,
      order: [[sortBy, order]],
      limit,
      offset,
    });

    // Base URL for documents
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Map data to include full document URL and camelCase keys
    const mappedForms = rows.map(form => ({
      id: form.id,
      en_title: form.en_title,
      od_title: form.od_title,
      document: form.document ? `${baseUrl}/uploads/forms/${form.document}` : null,
      is_active: form.is_active,
      displayOrder: form.display_order,  // fix: use form.display_order here
      created_at: form.created_at,
      updated_at: form.updated_at,
    }));

    // Send response
    res.json({
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      data: mappedForms,
    });
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
