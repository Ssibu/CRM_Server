import HomeAdmin from '../../models/HomeAdmin.js';
import sequelize from '../../../config/db.js';
import path from "path";
import fs from "fs";
import { log } from '../../services/LogService.js';
const deleteFile = (filename) => {
  if (filename) {
    const filePath = path.join('public/uploads/home-admins', filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
};
// --- THIS IS THE NEW, CORRECTED CONTROLLER ---
export const getHomeAdmins = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // 1. Fetch the first 3 existing records
    let homeAdmins = await HomeAdmin.findAll({
      order: [['id', 'ASC']],
      limit: 3,
      transaction
    });

    // 2. If there are fewer than 3, create the missing ones
    const recordsToCreate = 3 - homeAdmins.length;
    if (recordsToCreate > 0) {
      for (let i = 0; i < recordsToCreate; i++) {
        const newAdmin = await HomeAdmin.create({
          en_name: '',
          od_name: '',
          en_designation: '',
          od_designation: '',
          image: '',
        }, { transaction });
        homeAdmins.push(newAdmin);
      }
    }

    await transaction.commit();
    await log({
         req,
         action:"READ ",
         page_name:"HOME ADMIN LIST",
        //  target:photo.en_title ,
        
       });
   


    res.status(200).json(homeAdmins);

  } catch (error) {
    await transaction.rollback();
    console.error("Error fetching or creating home admins:", error);
    res.status(500).json({ message: "Server error while fetching home admins." });
  }
};

// export const updateHomeAdmins = async (req, res) => {
//   const transaction = await sequelize.transaction();
//   try {
//     const homeAdminsData = JSON.parse(req.body.data);
//     const files = req.files || [];

//     // Use Promise.all to run updates concurrently
//     await Promise.all(homeAdminsData.map(async (adminData) => {
//       const { id, en_name, od_name, en_designation, od_designation } = adminData;

//       // Validate required fields
//       if (
//         !id ||
//         !en_name?.trim() ||
//         !od_name?.trim() ||
//         !en_designation?.trim() ||
//         !od_designation?.trim()
//       ) {
//         // Skip or throw an error for invalid data
//         throw new Error(`Invalid or empty fields detected.`);
//       }

//       // Find the record to update by its actual ID
//       const record = await HomeAdmin.findByPk(id, { transaction });
//       if (!record) return; // Skip if ID is somehow invalid

//       record.en_name = en_name.trim();
//       record.od_name = od_name.trim();
//       record.en_designation = en_designation.trim();
//       record.od_designation = od_designation.trim();

//       // Associate the correct file with this admin record
//       const fileForThisAdmin = files.find(f => f.originalname.startsWith(`home_admin_${id}_`));
//       if (fileForThisAdmin) {
//         deleteFile(record.image);
//         record.image = path.basename(fileForThisAdmin.path);
//       }

      
//       await record.save({ transaction });
//     }));

//      await log({
//          req,
//          action:"UPDATE  ",
//          page_name:"HOME ADMIN LIST",
//         //  target:photo.en_title ,
        
//        });

//     await transaction.commit();
//     res.status(200).json({ message: "Home admin members updated successfully!" });
//   } catch (error) {
//     await transaction.rollback();
//     console.error("Error updating home admins:", error);
//     res.status(400).json({ message: error.message || "Server error while updating." });
//   }
// };

export const updateHomeAdmins = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const homeAdminsData = JSON.parse(req.body.data);
    const files = req.files || [];

    // Validation helper
    const validateField = (field, fieldName, maxLength) => {
      if (!field || !field.trim()) {
        throw new Error(`${fieldName} is required.`);
      }
      if (field.trim().length > maxLength) {
        throw new Error(`${fieldName} must not exceed ${maxLength} characters.`);
      }
    };

    await Promise.all(
      homeAdminsData.map(async (adminData) => {
        const { id, en_name, od_name, en_designation, od_designation } = adminData;

        // Validate fields
        if (!id) throw new Error("ID is required for updating Home Admin.");

        validateField(en_name, "English Name", 101);
        validateField(od_name, "Odia Name", 101);
        validateField(en_designation, "English Designation", 55);
        validateField(od_designation, "Odia Designation", 55);

        // Find the record
        const record = await HomeAdmin.findByPk(id, { transaction });
        if (!record) throw new Error(`Home Admin with ID ${id} not found.`);

        // Update fields
        record.en_name = en_name.trim();
        record.od_name = od_name.trim();
        record.en_designation = en_designation.trim();
        record.od_designation = od_designation.trim();

        // Handle file upload for this admin
        const fileForThisAdmin = files.find((f) =>
          f.originalname.startsWith(`home_admin_${id}_`)
        );
        if (fileForThisAdmin) {
          deleteFile(record.image);
          record.image = path.basename(fileForThisAdmin.path);
        }

        await record.save({ transaction });
      })
    );

    await log({
      req,
      action: "UPDATE",
      page_name: "HOME ADMIN LIST",
    });

    await transaction.commit();
    res.status(200).json({ message: "Home admin members updated successfully!" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating home admins:", error);
    res
      .status(400)
      .json({ message: error.message || "Server error while updating." });
  }
};
