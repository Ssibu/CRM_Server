// import DirectorDesk from '../../models/DirectorDesk.js';
// import path from "path";
// import fs from "fs";
// import { log } from '../../services/LogService.js';



// const deleteFile = (filename) => {
//     if (filename) {
//         const filePath = path.join('public/uploads/director-desk', filename);
//         if (fs.existsSync(filePath)) {
//             fs.unlinkSync(filePath);
//         }
//     }
// };

// const getDirectorDeskRecord = async () => {
//     const [record] = await DirectorDesk.findOrCreate({
//         where: { id: 1 },
//         defaults: {
//             en_title: '', od_title: '',
//             en_name: '', od_name: '',
//             en_designation: '', od_designation: '',
//             en_message: '', od_message: '',
//         }
//     });
//     return record;
// };

// export const getDirectorDesk = async (req, res) => {
//     try {
//         const record = await getDirectorDeskRecord();
      
//                 await log({
//               req,
//               action:"READ",
//               page_name:"DIRECTOR DESK",
//             });


//         res.status(200).json({
//             en_title: record.en_title, od_title: record.od_title,
//             en_director_name: record.en_name, od_director_name: record.od_name,
//             en_designation: record.en_designation, od_designation: record.od_designation,
//             en_message: record.en_message, od_message: record.od_message,
//             logo: record.department_img, photo: record.director_img,
//         });
//     } catch (error) {
//         console.error("Error fetching Director's Desk data:", error);
//         res.status(500).json({ message: "Server error." });
//     }
// };



// export const updateDirectorDesk = async (req, res) => {
//     try {
//         const record = await getDirectorDeskRecord();
//         const {
//             en_title, od_title,
//             en_director_name, od_director_name,
//             en_designation, od_designation,
//             en_message, od_message
//         } = req.body;

//         if (!en_title || !od_title || !en_director_name || !od_director_name || !en_message || !od_message) {
//             return res.status(400).json({ message: "Please fill all required text fields." });
//         }

//         record.en_title = en_title;
//         record.od_title = od_title;
//         record.en_name = en_director_name;
//         record.od_name = od_director_name;
//         record.en_designation = en_designation;
//         record.od_designation = od_designation;
//         record.en_message = en_message;
//         record.od_message = od_message;
        
//         if (req.files) {
//             if (req.files.logo) {
//                 deleteFile(record.department_img);
//                 record.department_img = path.basename(req.files.logo[0].path);
//             }
//             if (req.files.photo) {
//                 deleteFile(record.director_img);
//                 record.director_img = path.basename(req.files.photo[0].path);
//             }
//         }
        
//         await record.save();
//                   await log({
//               req,
//               action:"UPDATE",
//               page_name:"DIRECTOR DESK"
//                         });

//         res.status(200).json({ message: "Director's Desk updated successfully!" });
//     } catch (error) {
//         console.error("Error updating Director's Desk data:", error);
//         res.status(500).json({ message: "Server error." });
//     }
// };


import DirectorDesk from '../../models/DirectorDesk.js';
import path from "path";
import fs from "fs";
import { log } from '../../services/LogService.js';

const UPLOAD_DIR = 'public/uploads/director-desk';

// Delete old file if it exists
const deleteFile = (filename) => {
    if (filename) {
        const filePath = path.join(UPLOAD_DIR, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

// Character limits
const LIMITS = {
    TITLE: 100,
    NAME: 100,
    DESIGNATION: 55,
    MESSAGE: 2000
};

// Helper for text validation
const isEmpty = (text) => {
    return !text || typeof text !== 'string' || !text.trim();
};

const exceedsLimit = (text, limit) => {
    return text.trim().length > limit;
};

// Get or create record
const getDirectorDeskRecord = async () => {
    const [record] = await DirectorDesk.findOrCreate({
        where: { id: 1 },
        defaults: {
            en_title: '', od_title: '',
            en_name: '', od_name: '',
            en_designation: '', od_designation: '',
            en_message: '', od_message: '',
        }
    });
    return record;
};

// Get API
export const getDirectorDesk = async (req, res) => {
    try {
        const record = await getDirectorDeskRecord();

        await log({
            req,
            action: "READ",
            page_name: "DIRECTOR DESK",
        });

        res.status(200).json({
            en_title: record.en_title, od_title: record.od_title,
            en_director_name: record.en_name, od_director_name: record.od_name,
            en_designation: record.en_designation, od_designation: record.od_designation,
            en_message: record.en_message, od_message: record.od_message,
            logo: record.department_img,
            photo: record.director_img,
        });
    } catch (error) {
        console.error("Error fetching Director's Desk data:", error);
        res.status(500).json({ message: "Server error." });
    }
};

// Update API
export const updateDirectorDesk = async (req, res) => {
    try {
        const record = await getDirectorDeskRecord();

        const {
            en_title, od_title,
            en_director_name, od_director_name,
            en_designation, od_designation,
            en_message, od_message
        } = req.body;

        const errors = {};

        // Required + length validations
        if (isEmpty(en_title)) errors.en_title = "English title is required";
        else if (exceedsLimit(en_title, LIMITS.TITLE)) errors.en_title = `English title cannot exceed ${LIMITS.TITLE} characters`;

        if (isEmpty(od_title)) errors.od_title = "Odia title is required";
        else if (exceedsLimit(od_title, LIMITS.TITLE)) errors.od_title = `Odia title cannot exceed ${LIMITS.TITLE} characters`;

        if (isEmpty(en_director_name)) errors.en_director_name = "English name is required";
        else if (exceedsLimit(en_director_name, LIMITS.NAME)) errors.en_director_name = `English name cannot exceed ${LIMITS.NAME} characters`;

        if (isEmpty(od_director_name)) errors.od_director_name = "Odia name is required";
        else if (exceedsLimit(od_director_name, LIMITS.NAME)) errors.od_director_name = `Odia name cannot exceed ${LIMITS.NAME} characters`;

        if (!isEmpty(en_designation) && exceedsLimit(en_designation, LIMITS.DESIGNATION)) {
            errors.en_designation = `English designation cannot exceed ${LIMITS.DESIGNATION} characters`;
        }

        if (!isEmpty(od_designation) && exceedsLimit(od_designation, LIMITS.DESIGNATION)) {
            errors.od_designation = `Odia designation cannot exceed ${LIMITS.DESIGNATION} characters`;
        }

        if (isEmpty(en_message)) errors.en_message = "English message is required";
        else if (exceedsLimit(en_message, LIMITS.MESSAGE)) errors.en_message = `English message cannot exceed ${LIMITS.MESSAGE} characters`;

        if (isEmpty(od_message)) errors.od_message = "Odia message is required";
        else if (exceedsLimit(od_message, LIMITS.MESSAGE)) errors.od_message = `Odia message cannot exceed ${LIMITS.MESSAGE} characters`;

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                message: "Validation failed",
                errors,
            });
        }

        // Update text fields
        record.en_title = en_title;
        record.od_title = od_title;
        record.en_name = en_director_name;
        record.od_name = od_director_name;
        record.en_designation = en_designation;
        record.od_designation = od_designation;
        record.en_message = en_message;
        record.od_message = od_message;

        // Handle image uploads
        if (req.files) {
            if (req.files.logo) {
                deleteFile(record.department_img);
                record.department_img = path.basename(req.files.logo[0].path);
            }
            if (req.files.photo) {
                deleteFile(record.director_img);
                record.director_img = path.basename(req.files.photo[0].path);
            }
        }

        await record.save();

        await log({
            req,
            action: "UPDATE",
            page_name: "DIRECTOR DESK"
        });

        res.status(200).json({ message: "Director's Desk updated successfully!" });

    } catch (error) {
        console.error("Error updating Director's Desk data:", error);
        res.status(500).json({ message: "Server error." });
    }
};
