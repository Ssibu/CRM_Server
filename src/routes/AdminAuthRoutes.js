import express from 'express';
import {
  deleteUser,
  getAllUsers,
  getAllAdmins,        // <-- import new controller
  getLoggedInUser,
  getUserById,
  login,
  logout,
  register,
  toggleUserStatus,
  updateUser,
} from '../controllers/AdminAuthController.js';
import authMiddleware from '../middlewares/AuthMiddleware.js';
import upload  from '../middlewares/UploadMiddleware.js';

const adminAuthRoutes = express.Router();

// 🔐 Auth Routes
adminAuthRoutes.post('/login', login);
adminAuthRoutes.post('/logout', logout);
adminAuthRoutes.get('/me', authMiddleware, getLoggedInUser);

// 🧑‍💼 Admin-only (or protected) routes

// ✅ Register route with image upload
adminAuthRoutes.post(
  '/register',
  // authMiddleware,
  ...upload({
    field: 'profilePic',
    mode: 'single',
    prefix: 'profile',
    uploadDir: 'public/uploads/profiles',
    resize: true,
    width: 300,
    height: 300,
    allowedTypes: ['image/'],
    maxSize: 5 * 1024 * 1024,
  }),
  register
);

// ✅ Update user with image upload
adminAuthRoutes.put(
  '/users/:id',
  authMiddleware,
  ...upload({
    field: 'profilePic',
    mode: 'single',
    prefix: 'profile',
    uploadDir: 'public/uploads/profiles',
    resize: true,
    width: 300,
    height: 300,
    allowedTypes: ['image/'],
    maxSize: 5 * 1024 * 1024,
  }),
  updateUser
);

// 📋 Users Management
adminAuthRoutes.get('/allusers', authMiddleware, getAllUsers);
adminAuthRoutes.get('/alladmins', authMiddleware, getAllAdmins);  // <-- New route here
adminAuthRoutes.get('/users/:id', authMiddleware, getUserById);
adminAuthRoutes.delete('/users/:id', authMiddleware, deleteUser);
adminAuthRoutes.put('/users/:id/status', authMiddleware, toggleUserStatus);

// http://localhost:7777/admin/alladmins
export default adminAuthRoutes;
