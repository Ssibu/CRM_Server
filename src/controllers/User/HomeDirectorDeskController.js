import models from '../../models/index.js'; 

const {DirectorDesk, HomeSetting} = models

// Fetches the latest director's message and the home page's "About Us" overview.
export const getDirectorAndAboutData = async (req, res) => {
  try {
    // Find the most recent, active entry from the Director's Desk
    const directorDeskData = await DirectorDesk.findOne({
      where: { is_active: true, is_delete: false },
      order: [['created_at', 'DESC']], // Get the latest one
    });

    // Find the home settings (usually there's only one row)
    const homeSettingData = await HomeSetting.findOne();

    if (!directorDeskData && !homeSettingData) {
      return res.status(404).json({ message: "No data found." });
    }

    res.status(200).json({
      directorDesk: directorDeskData,
      homeSetting: homeSettingData,
    });

  } catch (error) {
    console.error("Error fetching director and about data:", error);
    res.status(500).json({ message: "Server error while fetching data." });
  }
};