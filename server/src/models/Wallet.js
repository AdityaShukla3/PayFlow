import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    // CRITICAL: Balance is stored in paise as an integer (e.g., 10000 paise = 100.00 INR).
    // Integer arithmetic avoids binary floating-point rounding issues in financial applications.
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Wallet balance cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Balance must be an integer represented in paise',
      },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    versionKey: false,
  }
);

export const Wallet = mongoose.model('Wallet', walletSchema);
