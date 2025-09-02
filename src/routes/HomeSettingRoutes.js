
import express from 'express';
import { getSettings, updateSettings } from '../controllers/HomeSettingController.js';
import upload  from '../middlewares/UploadMiddleware.js';
import {auth, hp} from "../middlewares/AuthMiddleware.js"

const router = express.Router();
router.use(auth).use(hp("HC"))

// This route does not need middleware
router.get('/', getSettings);

// This route needs the file upload middleware
router.put(
    '/', 

    ...upload({
        mode: 'fields',
        field: [
            { name: 'odishaLogo', maxCount: 1 },
            { name: 'cmPhoto', maxCount: 1 }
        ],
        prefix: 'setting',
        uploadDir: 'public/uploads/settings'
    }), 
    updateSettings
);

export default router;