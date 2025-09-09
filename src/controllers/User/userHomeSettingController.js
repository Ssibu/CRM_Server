// controllers/User/userHomeSettingController.js

import models from '../../models/index.js';

const { HomeSetting } = models;
const SETTINGS_ID = 1;
const UPLOAD_SUB_DIR = 'uploads/settings';

const getFullFileUrl = (req, fileName) => {
  if (!fileName) return null;
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/${UPLOAD_SUB_DIR}/${fileName}`;
};

export const getPublicSettings = async (req, res) => {
  try {
    console.log("Fetching public settings...");
    
    const settings = await HomeSetting.findByPk(SETTINGS_ID);
    
    if (!settings) {
      return res.status(404).json({ message: "Home settings not found" });
    }

    const settingsJSON = settings.toJSON();
    console.log("Database settings found");

    // SIMPLIFIED RESPONSE - return exactly what frontend expects
    const response = {
      // English
      en_organizationName: settingsJSON.en_org_name,
      en_address: settingsJSON.en_address,
      en_personName: settingsJSON.en_person_name,
      en_personDesignation: settingsJSON.en_person_designation,

      // Odia - CORRECT FIELD NAMES
      od_organizationName: settingsJSON.od_org_name,
      od_address: settingsJSON.od_address,
      od_personName: settingsJSON.od_person_name,
      od_personDesignation: settingsJSON.od_person_designation,

      // Images
      odishaLogoUrl: getFullFileUrl(req, settingsJSON.odishaLogo),
      cmPhotoUrl: getFullFileUrl(req, settingsJSON.cmPhoto)
    };

    console.log("API Response prepared");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ 
      message: "Failed to get settings", 
      error: error.message 
    });
  }
};