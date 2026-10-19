import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { registerSchema, loginSchema } from '../validations/authValidation.js';

const router = Router();

// Rate limiter applies to sensitive auth endpoints
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// Protected endpoint to fetch current user session & wallet
router.get('/me', authenticate, authController.getMe);

export default router;
