import express from 'express'
import { getHomeAdmins } from '../../controllers/User/DisplayHomeAdminController.js';

const displayHomeAdminRouter=express.Router();


displayHomeAdminRouter.get('/display-home-admins',getHomeAdmins);

export default displayHomeAdminRouter;