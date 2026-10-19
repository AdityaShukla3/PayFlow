import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri:
    process.env.NODE_ENV === 'test'
      ? process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/payflow_test'
      : process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/payflow',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_payflow_secure_key_123',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
