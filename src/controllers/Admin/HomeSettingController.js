// controllers/homeSettingController.js
import fs from 'fs';
import models from '../../models/index.js';
import path from 'path';
import { text } from 'stream/consumers';
import { log } from '../../services/LogService.js';
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
const isRichTextEmpty = (htmlString) => {
  if (!htmlString || typeof htmlString !== 'string') {
    return true;
  }
  // Use a regular expression to replace all HTML tags with an empty string, then trim whitespace.
  const plainText = htmlString.replace(/<[^>]*>/g, '').trim();
  return plainText.length === 0;
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
   await log({
      req,
      action:"READ",
      page_name:"HOME CONFIGURATION PAGE",
    })
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
    // First, find the existing settings. We need this to check if images already exist.
    const [settings] = await HomeSetting.findOrCreate({
      where: { id: SETTINGS_ID },
      defaults: { id: SETTINGS_ID }
    });
    
    // --- START: SERVER-SIDE VALIDATION (Based on your UI) ---

    // Define which fields come from a Rich Text Editor
    const richTextFields = [
      "en_org_name", "od_org_name",
      "en_person_designation", "od_person_designation",
      "en_overview_description", "od_overview_description",
      "en_address", "od_address"
    ];

    // Define all required fields (both plain text and rich text)
    const requiredTextFields = [
      ...richTextFields,
      "en_person_name", "od_person_name", "email", "mobileNumber"
    ];

    const missingFields = [];

    // 1. Validate all text-based fields
    requiredTextFields.forEach(field => {
      const value = req.body[field];
      
      // Use the special rich text checker for rich text fields
      if (richTextFields.includes(field)) {
        if (isRichTextEmpty(value)) {
          missingFields.push(field);
        }
      } else {
        // Use a simple trim check for regular text fields
        if (!value || typeof value !== 'string' || !value.trim()) {
          missingFields.push(field);
        }
      }
    });
    
    // 2. Validate image fields
    // An image is required if there is no existing image AND no new file is being uploaded.
    if (!settings.odishaLogo && (!req.files || !req.files.odishaLogo)) {
        missingFields.push("odishaLogo");
    }
    if (!settings.cmPhoto && (!req.files || !req.files.cmPhoto)) {
        missingFields.push("cmPhoto");
    }

    // 3. If any fields are missing, return an error and stop.
    if (missingFields.length > 0) {
      const fieldLabels = { /* You can copy your fieldLabels map here for better error messages */ };
      const missingFieldNames = missingFields.map(f => fieldLabels[f] || f);
      
      return res.status(400).json({
        message: `Some fields are required and cannot be empty.`,
      });
    }
    // --- END: SERVER-SIDE VALIDATION ---

    const { ...textData } = req.body;

    // (The rest of your file handling logic is correct and remains unchanged)
    if (req.files) {
      if (req.files.odishaLogo && req.files.odishaLogo.length > 0) {
        const uploadedFile = req.files.odishaLogo[0];
        newOdishaLogoFile = path.basename(uploadedFile.path);
        if (settings.odishaLogo) {
          const oldFullFilePath = path.join(process.cwd(), UPLOAD_ROOT_DIR, UPLOAD_SUB_DIR, settings.odishaLogo);
          if (fs.existsSync(oldFullFilePath)) fs.unlinkSync(oldFullFilePath);
        }
        textData.odishaLogo = newOdishaLogoFile;
      }

      if (req.files.cmPhoto && req.files.cmPhoto.length > 0) {
        const uploadedFile = req.files.cmPhoto[0];
        newCmPhotoFile = path.basename(uploadedFile.path);
        if (settings.cmPhoto) {
          const oldFullFilePath = path.join(process.cwd(), UPLOAD_ROOT_DIR, UPLOAD_SUB_DIR, settings.cmPhoto);
          if (fs.existsSync(oldFullFilePath)) fs.unlinkSync(oldFullFilePath);
        }
        textData.cmPhoto = newCmPhotoFile;
      }
    }

    const updatedSettings = await settings.update(textData);
    
    const responseSettings = updatedSettings.toJSON();
    responseSettings.odishaLogoUrl = getFullFileUrl(req, updatedSettings.odishaLogo);
    responseSettings.cmPhotoUrl = getFullFileUrl(req, updatedSettings.cmPhoto);

    await log({
      req,
      action: "UPDATE",
      page_name: "UPDATE HOME CONFIGURATION",
      target: updatedSettings.en_org_name,
    });

    res.status(200).json({ message: "Settings updated successfully!", data: responseSettings });

  } catch (error) {
    // (Your error handling and file cleanup logic is correct and remains unchanged)
    if (newOdishaLogoFile) {
        const filePathToDelete = path.join(process.cwd(), UPLOAD_ROOT_DIR, UPLOAD_SUB_DIR, newOdishaLogoFile);
        if (fs.existsSync(filePathToDelete)) fs.unlinkSync(filePathToDelete);
    }
    if (newCmPhotoFile) {
        const filePathToDelete = path.join(process.cwd(), UPLOAD_ROOT_DIR, UPLOAD_SUB_DIR, newCmPhotoFile);
        if (fs.existsSync(filePathToDelete)) fs.unlinkSync(filePathToDelete);
    }
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Error updating settings", error: error.message });
  }
};
