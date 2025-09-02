
// controllers/homeSettingController.js
import fs from 'fs';
import models from '../models/index.js';
import path from 'path';

const { HomeSetting } = models;
const SETTINGS_ID = 1;
const UPLOAD_ROOT_DIR = 'public'; // Root directory where all uploads are stored
const UPLOAD_SUB_DIR = 'uploads/settings'; // Subdirectory for settings files

// Helper function to construct the full absolute URL for a file
const getFullFileUrl = (req, fileName) => {
    if (!fileName) return null;
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/${UPLOAD_SUB_DIR}/${fileName}`;
};

// Get the current homepage settings
export const getSettings = async (req, res) => {
  try {
    const [settings] = await HomeSetting.findOrCreate({
      where: { id: SETTINGS_ID },
      defaults: { id: SETTINGS_ID }
    });

    const settingsJSON = settings.toJSON();

    // Add URLs with full absolute path
    settingsJSON.odishaLogoUrl = getFullFileUrl(req, settings.odishaLogo);
    settingsJSON.cmPhotoUrl = getFullFileUrl(req, settings.cmPhoto);

    res.status(200).json(settingsJSON);

  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Error fetching settings", error: error.message });
  }
};

// Update the homepage settings
export const updateSettings = async (req, res) => {
  let newOdishaLogoFile = null;
  let newCmPhotoFile = null;

  try {
    const [settings] = await HomeSetting.findOrCreate({
      where: { id: SETTINGS_ID },
      defaults: { id: SETTINGS_ID }
    });
    
    const { ...textData } = req.body;

    if (req.files) {
      // Odisha Logo
      if (req.files.odishaLogo && req.files.odishaLogo.length > 0) {
        const uploadedFile = req.files.odishaLogo[0];
        newOdishaLogoFile = path.basename(uploadedFile.path); // only filename

        // Delete old file if exists
        if (settings.odishaLogo) {
          const oldFullFilePath = path.join(process.cwd(), UPLOAD_ROOT_DIR, UPLOAD_SUB_DIR, settings.odishaLogo);
          if (fs.existsSync(oldFullFilePath)) {
            fs.unlinkSync(oldFullFilePath);
            console.log(`Deleted old Odisha Logo: ${oldFullFilePath}`);
          }
        }
        textData.odishaLogo = newOdishaLogoFile;
      }

      // CM Photo
      if (req.files.cmPhoto && req.files.cmPhoto.length > 0) {
        const uploadedFile = req.files.cmPhoto[0];
        newCmPhotoFile = path.basename(uploadedFile.path); // only filename

        if (settings.cmPhoto) {
          const oldFullFilePath = path.join(process.cwd(), UPLOAD_ROOT_DIR, UPLOAD_SUB_DIR, settings.cmPhoto);
          if (fs.existsSync(oldFullFilePath)) {
            fs.unlinkSync(oldFullFilePath);
            console.log(`Deleted old CM Photo: ${oldFullFilePath}`);
          }
        }
        textData.cmPhoto = newCmPhotoFile;
      }
    }

    const updatedSettings = await settings.update(textData);
    
    const responseSettings = updatedSettings.toJSON();
    responseSettings.odishaLogoUrl = getFullFileUrl(req, updatedSettings.odishaLogo);
    responseSettings.cmPhotoUrl = getFullFileUrl(req, updatedSettings.cmPhoto);

    res.status(200).json({ message: "Settings updated successfully!", data: responseSettings });

  } catch (error) {
    // Cleanup if error
    if (newOdishaLogoFile) {
      const filePathToDelete = path.join(process.cwd(), UPLOAD_ROOT_DIR, UPLOAD_SUB_DIR, newOdishaLogoFile);
      if (fs.existsSync(filePathToDelete)) {
        fs.unlinkSync(filePathToDelete);
        console.log(`Cleaned up new Odisha Logo due to error: ${filePathToDelete}`);
      }
    }
    if (newCmPhotoFile) {
      const filePathToDelete = path.join(process.cwd(), UPLOAD_ROOT_DIR, UPLOAD_SUB_DIR, newCmPhotoFile);
      if (fs.existsSync(filePathToDelete)) {
        fs.unlinkSync(filePathToDelete);
        console.log(`Cleaned up new CM Photo due to error: ${filePathToDelete}`);
      }
    }
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Error updating settings", error: error.message });
  }
};
