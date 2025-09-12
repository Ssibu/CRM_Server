import express from 'express';
import { getAllForms } from '../../controllers/User/FormsController.js';


const formRouter = express.Router();

formRouter.get('/forms', getAllForms);

export default formRouter;
