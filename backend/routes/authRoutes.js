import express from 'express';

import { getUserProfile, loginUser, registerUser } from '../controllers/authcontroller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/profile').get(protect, getUserProfile);

export default router;
