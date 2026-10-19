import * as authService from '../services/authService.js';

/**
 * Handle user registration: POST /api/auth/register
 */
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const result = await authService.registerUser({ name, email, password });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle user login: POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieve current user profile & wallet: GET /api/auth/me
 */
export async function getMe(req, res, next) {
  try {
    // req.user is set by the authenticate middleware
    const result = await authService.getCurrentUser(req.user._id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
