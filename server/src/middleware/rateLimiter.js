import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

/**
 * Rate limiter for authentication endpoints.
 * Protects against brute-force attacks and credential stuffing.
 * Disabled in test environment to prevent flaky automated tests.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skip: () => config.nodeEnv === 'test', // Bypass in test runs
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});
