import express from 'express'
import { getAllHomePageBanners } from '../../controllers/User/BannerController.js';

const BannerRouter=express.Router()
BannerRouter.get('/allbanners',getAllHomePageBanners)

export default BannerRouter;