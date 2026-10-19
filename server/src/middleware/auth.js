import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/appError.js';

/**
 * Middleware to verify JWT token and attach user to request object.
 * Used to protect private routes.
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // Check for Authorization: Bearer <token>
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication token missing or malformed', 401));
    }

    const token = authHeader.split(' ')[1];

    // Verify token signature and expiration
    const decoded = jwt.verify(token, config.jwtSecret);

    // Verify user still exists in database
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return next(new AppError('User belonging to this token no longer exists', 401));
    }

    // Attach user to request for downstream handlers
    req.user = user;
    next();
  } catch (error) {
    next(error); // Caught by centralized errorHandler (JsonWebTokenError / TokenExpiredError)
  }
}
