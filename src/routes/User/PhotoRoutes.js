import express from 'express';
import { getAllPhotos } from '../../controllers/User/GalleryController.js';


const photoRouter = express.Router();

photoRouter.get('/allimages', getAllPhotos);

export default photoRouter;
