// // routes/homeSettingRoutes.js

// import express from 'express';
// import  {getPublicSettings}  from '../../controllers/User/userHomeSettingController.js';

// const router = express.Router();

// // ✅ Public GET route — no auth middleware needed
// router.get('/', getPublicSettings);

// export default router;


import express from 'express';
import { getPublicSettings } from '../../controllers/User/userHomeSettingController.js';

const router = express.Router();

// ✅ Public GET route — no auth middleware needed
router.get('/', getPublicSettings);

export default router;