import HomeAdmin from "../../models/HomeAdmin.js";

export const getHomeAdmins = async (req, res) => {
  try {
    // Fetch all active and not deleted home admins
    const homeAdmins = await HomeAdmin.findAll({
      where: {
        is_active: true,
        is_delete: false,
      },
      attributes: ['en_name', 'od_name', 'en_designation', 'od_designation', 'image'], // include odia fields
    });

    // Map and construct full image URLs with all required fields
    const data = homeAdmins.map(admin => {
      const obj = admin.toJSON();
      return {
        en_name: obj.en_name,
        od_name: obj.od_name,
        en_designation: obj.en_designation,
        od_designation: obj.od_designation,
        image_url: obj.image
          ? `${req.protocol}://${req.get('host')}/uploads/home-admins/${obj.image}`
          : null,
      };
    });

    return res.status(200).json({
      total: data.length,
      data,
    });
  } catch (error) {
    console.error('Error fetching HomeAdmins:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
