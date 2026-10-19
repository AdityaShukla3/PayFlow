import mongoose from 'mongoose';
import { config } from './env.js';

/**
 * Connect to MongoDB using Mongoose.
 * Logs connection status and exits process on critical failure in production/dev.
 */
export async function connectDB(uri = config.mongodbUri) {
  try {
    const conn = await mongoose.connect(uri);
    if (config.nodeEnv !== 'test') {
      console.log(`[MongoDB] Connected to: ${conn.connection.host}/${conn.connection.name}`);
    }
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    if (config.nodeEnv !== 'test') {
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Disconnect from MongoDB (useful for cleaning up during integration tests).
 */
export async function disconnectDB() {
  await mongoose.disconnect();
}
