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
  generateCaptcha
} from '../controllers/AdminAuthController.js';
import {auth, hp} from '../middlewares/AuthMiddleware.js';
import upload  from '../middlewares/UploadMiddleware.js';

const router = express.Router();

router.get('/captcha', generateCaptcha);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', auth, getLoggedInUser);


router.post(
  '/register',
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

router.put(
  '/users/:id',
  auth,
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

router.get('/allusers', auth, hp("MU"),getAllUsers);
router.get('/alladmins', auth, getAllAdmins);  
router.get('/users/:id', auth, getUserById);
router.delete('/users/:id', auth, deleteUser);
router.patch('/users/:id/status', auth, toggleUserStatus);

router.patch('/change-password', auth, changeUserPassword);

export default router;
