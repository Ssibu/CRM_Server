import express from 'express';
import { getDirectorDesk } from '../../controllers/User/DirectorDeskController.js';


const router = express.Router();



router.get("/", getDirectorDesk);



export default router;
