import express from 'express';
import { listLogs } from '../../controllers/Admin/LogRecordController.js';
import { auth, hp } from '../../middlewares/AuthMiddleware.js'; 

const router = express.Router();

router.use(auth).use(hp("LR"))

router.get('/', listLogs);

export default router;