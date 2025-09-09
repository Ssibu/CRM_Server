import express from 'express';
import { getAllVideos } from '../../controllers/User/GalleryController.js';



const videoRouter = express.Router();

// GET /api/videos
videoRouter.get('/allvideos', getAllVideos);

export default videoRouter;
