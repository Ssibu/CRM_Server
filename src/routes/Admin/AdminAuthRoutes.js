import express from 'express';
import {
  deleteUser,
  getAllUsers,
  getAllAdmins,    
  getLoggedInUser,
  getUserById,
  login,
  logout,
  register,
  toggleUserStatus,
  updateUser,
  changeUserPassword ,
  generateCaptcha,
  forgotPassword,
  resetPassword
} from '../../controllers/Admin/AdminAuthController.js';
import {auth, hp} from '../../middlewares/AuthMiddleware.js';
import upload  from '../../middlewares/UploadMiddleware.js';

const router = express.Router();

router.get('/captcha', generateCaptcha);
router.post('/login',  login);
router.post('/logout', auth, logout);
router.get('/session', auth, getLoggedInUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.post(
  '/register',
  ...upload({
    field: 'profilePic',
    mode: 'single',
    prefix: 'profile',
    uploadDir: 'public/uploads/profiles',
    resize: true,
    width: 800,
    height: 600,
    allowedTypes: ['image/'],
    maxSize: 5 * 1024 * 1024,
  }),
  register
);

router.put(
  '/users/:id',
  auth,
  ...upload({
    field: 'profilePic',
    mode: 'single',
    prefix: 'profile',
    uploadDir: 'public/uploads/profiles',
    resize: true,
    width: 800,
    height: 600,
    allowedTypes: ['image/'],
    maxSize: 5 * 1024 * 1024,
  }),
  updateUser
);

router.get('/allusers', auth, hp("MU"),getAllUsers);
router.get('/alladmins', auth, getAllAdmins);  
router.get('/users/:id', auth, getUserById);
router.delete('/users/:id', auth, deleteUser);
router.patch('/users/:id/status', auth, toggleUserStatus);

router.patch('/change-password', auth, changeUserPassword);

export default router;
