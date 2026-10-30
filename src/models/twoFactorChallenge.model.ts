import mongoose, { Schema } from 'mongoose';

const twoFactorChallengeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    codeHash: {
      type: String,
      required: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    resendCount: {
      type: Number,
      default: 0,
    },
    lastSentAt: {
      type: Date,
      required: true,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
    invalidatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

twoFactorChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

export const TwoFactorChallengeModel = mongoose.model(
  'TwoFactorChallenge',
  twoFactorChallengeSchema,
);