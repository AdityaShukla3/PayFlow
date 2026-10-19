import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ['ADD_MONEY', 'RECHARGE', 'BILL_PAYMENT'],
        message: '{VALUE} is not a valid transaction type',
      },
      required: [true, 'Transaction type is required'],
    },
    // Amount in paise as an integer (e.g. 50000 = ₹500.00)
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [1, 'Transaction amount must be greater than 0'],
      validate: {
        validator: Number.isInteger,
        message: 'Transaction amount must be an integer represented in paise',
      },
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
    },
    category: {
      type: String,
      trim: true,
    },
    operator: {
      type: String,
      trim: true,
    },
    targetNumber: {
      type: String,
      trim: true,
    },
    // Unique per user to prevent duplicate transaction submissions
    idempotencyKey: {
      type: String,
      trim: true,
    },
    failureReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

// Compound index so idempotencyKey is unique per user (sparse allows null/undefined)
transactionSchema.index(
  { user: 1, idempotencyKey: 1 },
  { unique: true, sparse: true }
);

export const Transaction = mongoose.model('Transaction', transactionSchema);
