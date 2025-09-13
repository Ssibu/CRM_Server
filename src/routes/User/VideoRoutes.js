import express from 'express';
import { getAllVideos ,getAllCategories,getAllVideosWithoutPagination} from '../../controllers/User/GalleryController.js';



const videoRouter = express.Router();

// GET /api/videos
videoRouter.get('/allvideos', getAllVideos);
videoRouter.get('/allcategories', getAllCategories);
videoRouter.get('/list', getAllVideosWithoutPagination);

export default videoRouter;
