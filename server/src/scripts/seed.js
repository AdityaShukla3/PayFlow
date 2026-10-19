import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';

async function seed() {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    const demoEmail = 'demo@payflow.local';
    const demoPassword = 'Password@123';

    // Remove existing demo user and linked wallet if any
    const existingUser = await User.findOne({ email: demoEmail });
    if (existingUser) {
      await Wallet.deleteMany({ user: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });
      console.log('[Seed] Cleaned up existing demo user.');
    }

    // Create fresh demo user
    const passwordHash = await bcrypt.hash(demoPassword, 10);
    const user = await User.create({
      name: 'Demo User',
      email: demoEmail,
      passwordHash,
    });

    // Create linked wallet with 0 balance (stored in paise)
    const wallet = await Wallet.create({
      user: user._id,
      balance: 0,
    });

    console.log('----------------------------------------------------');
    console.log('[Seed Success] Demo user successfully seeded:');
    console.log(`  Email:    ${demoEmail}`);
    console.log(`  Password: ${demoPassword}`);
    console.log(`  User ID:  ${user._id}`);
    console.log(`  Wallet:   ${wallet._id} (Balance: ${wallet.balance} paise)`);
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('[Seed Error]:', error.message);
    process.exit(1);
  } finally {
    await disconnectDB();
    console.log('[Seed] Disconnected from MongoDB.');
    process.exit(0);
  }
}

seed();
