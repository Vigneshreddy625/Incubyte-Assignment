import { Router } from 'express';
import {
  signup,
  login,
  refreshToken,
  logout,
  getProfile
} from '../controllers/auth.controller.js'; 
import { protect } from '../middlewares/auth.middleware.js'; 

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/profile', protect, getProfile);

export default router;