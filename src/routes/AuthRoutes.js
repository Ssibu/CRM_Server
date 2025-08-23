import express from 'express'
import { getAllUsers, login, register } from '../controllers/AuthController.js';
import authMiddleware from '../middlewares/AuthMiddleware.js';

const adminAuthRoutes=express.Router()
adminAuthRoutes.post('/register',register)
adminAuthRoutes.post('/login',login)
adminAuthRoutes.get('/allusers',authMiddleware  ,getAllUsers)



export default adminAuthRoutes;
