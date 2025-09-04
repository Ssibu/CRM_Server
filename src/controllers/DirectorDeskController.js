import DirectorDesk from '../models/DirectorDesk.js';
import path from "path";
import fs from "fs";

// const deleteFile = (filename) => {
//     if (filename) {
//         const filePath = path.join('public/uploads/director-desk', filename);
//         if (fs.existsSync(filePath)) {
//             fs.unlinkSync(filePath);
//         }
//     }
// };

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

export const getDirectorDesk = async (req, res) => {
    try {
        const record = await getDirectorDeskRecord();
        // Map DB names to frontend names for consistency
        res.status(200).json({
            en_title: record.en_title, od_title: record.od_title,
            en_director_name: record.en_name, od_director_name: record.od_name,
            en_designation: record.en_designation, od_designation: record.od_designation,
            en_message: record.en_message, od_message: record.od_message,
            logo: record.department_img, photo: record.director_img,
        });
    } catch (error) {
        console.error("Error fetching Director's Desk data:", error);
        res.status(500).json({ message: "Server error." });
    }
};

// export const updateDirectorDesk = async (req, res) => {
//     try {
//         const record = await getDirectorDeskRecord();
//         const {
//             en_title, od_title,
//             en_director_name, od_director_name,
//             en_designation, od_designation,
//             en_message, od_message
//         } = req.body;

//         record.en_title = en_title;
//         record.od_title = od_title;
//         record.en_name = en_director_name;
//         record.od_name = od_director_name;
//         record.en_designation = en_designation;
//         record.od_designation = od_designation;
//         record.en_message = en_message;
//         record.od_message = od_message;
        
//         // Handle file updates
//         if (req.files) {
//             if (req.files.logo) {
//                 // deleteFile(record.department_img);
//                 record.department_img = path.basename(req.files.logo[0].path);
//             }
//             if (req.files.photo) {
//                 // deleteFile(record.director_img);
//                 record.director_img = path.basename(req.files.photo[0].path);
//             }
//         }
        
//         await record.save();
//         res.status(200).json({ message: "Director's Desk updated successfully!" });
//     } catch (error) {
//         console.error("Error updating Director's Desk data:", error);
//         res.status(500).json({ message: "Server error." });
//     }
// };



export const updateDirectorDesk = async (req, res) => {
    try {
        const record = await getDirectorDeskRecord();
        const {
            en_title, od_title,
            en_director_name, od_director_name,
            en_designation, od_designation,
            en_message, od_message
        } = req.body;

        if (!en_title || !od_title || !en_director_name || !od_director_name || !en_message || !od_message) {
            return res.status(400).json({ message: "Please fill all required text fields." });
        }

        record.en_title = en_title;
        record.od_title = od_title;
        record.en_name = en_director_name;
        record.od_name = od_director_name;
        record.en_designation = en_designation;
        record.od_designation = od_designation;
        record.en_message = en_message;
        record.od_message = od_message;
        
        if (req.files) {
            if (req.files.logo) {
                // deleteFile(record.department_img);
                record.department_img = path.basename(req.files.logo[0].path);
            }
            if (req.files.photo) {
                // deleteFile(record.director_img);
                record.director_img = path.basename(req.files.photo[0].path);
            }
        }
        
        await record.save();
        res.status(200).json({ message: "Director's Desk updated successfully!" });
    } catch (error) {
        console.error("Error updating Director's Desk data:", error);
        res.status(500).json({ message: "Server error." });
    }
};