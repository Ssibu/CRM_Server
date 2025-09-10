import express from 'express'
import { findAllSchemes } from '../../controllers/User/SchemeController.js';

const schemeRouter=express.Router()
schemeRouter.get('/allschemes', findAllSchemes);

export default schemeRouter;