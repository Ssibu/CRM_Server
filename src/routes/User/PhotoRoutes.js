import express from 'express';
import { getAllPhotos ,getAllCategories,getAllPhotosWithoutPagination} from '../../controllers/User/GalleryController.js';


const photoRouter = express.Router();

photoRouter.get('/allimages', getAllPhotos);
photoRouter.get('/allcategories', getAllCategories);
photoRouter.get('/list', getAllPhotosWithoutPagination);
export default photoRouter;
