import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';
import { AppError } from '../utils/appError.js';
import { config } from '../config/env.js';

/**
 * Generate a signed JWT for the authenticated user.
 */
function signToken(userId) {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/**
 * Register a new user and initialize an empty wallet with 0 paise.
 */
export async function registerUser({ name, email, password }) {
  // 1. Check if email is already taken
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('An account with this email already exists', 409);
  }

  // 2. Hash password with bcrypt salt factor 10
  const passwordHash = await bcrypt.hash(password, 10);

  // 3. Create user document
  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  // 4. Initialize user's digital wallet with 0 paise
  const wallet = await Wallet.create({
    user: user._id,
    balance: 0,
  });

  // 5. Generate authentication token
  const token = signToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    wallet: {
      id: wallet._id,
      balance: wallet.balance, // in paise
    },
  };
}

/**
 * Authenticate existing user by verifying credentials.
 */
export async function loginUser({ email, password }) {
  // 1. Check if user exists (we need passwordHash for comparison)
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // 2. Verify password match
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // 3. Retrieve user wallet
  const wallet = await Wallet.findOne({ user: user._id });

  // 4. Generate JWT
  const token = signToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    wallet: {
      id: wallet?._id,
      balance: wallet?.balance ?? 0,
    },
  };
}

/**
 * Retrieve current user profile and linked wallet.
 */
export async function getCurrentUser(userId) {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const wallet = await Wallet.findOne({ user: userId });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    wallet: {
      id: wallet?._id,
      balance: wallet?.balance ?? 0,
    },
  };
}
