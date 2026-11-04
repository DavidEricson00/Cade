import { Types } from 'mongoose';
import { TwoFactorChallengeModel } from '../models/twoFactorChallenge.model';

type CreateChallengeData = {
  id: Types.ObjectId;
  userId: string;
  codeHash: string;
  expiresAt: Date;
  lastSentAt: Date;
};

type RenewChallengeData = {
  codeHash: string;
  expiresAt: Date;
  now: Date;
  maxResends: number;
  minIntervalMs: number;
};

const oid = (id: string) => new Types.ObjectId(id);

export async function createChallenge(data: CreateChallengeData) {
  return TwoFactorChallengeModel.create({
    _id: data.id,
    userId: oid(data.userId),
    codeHash: data.codeHash,
    expiresAt: data.expiresAt,
    lastSentAt: data.lastSentAt,
  });
}

export async function invalidateActiveChallenges(userId: string) {
  return TwoFactorChallengeModel.updateMany(
    { userId: oid(userId), consumedAt: null, invalidatedAt: null },
    { $set: { invalidatedAt: new Date() } },
  ).exec();
}

export async function invalidateChallenge(challengeId: string) {
  return TwoFactorChallengeModel.updateOne(
    { _id: oid(challengeId) },
    { $set: { invalidatedAt: new Date() } },
  ).exec();
}

export async function findActiveChallenge(challengeId: string, userId: string) {
  return TwoFactorChallengeModel.findOne({
    _id: oid(challengeId),
    userId: oid(userId),
    consumedAt: null,
    invalidatedAt: null,
  }).exec();
}

export async function registerAttempt(
  challengeId: string,
  userId: string,
  maxAttempts: number,
  now: Date,
) {
  return TwoFactorChallengeModel.findOneAndUpdate(
    {
      _id: oid(challengeId),
      userId: oid(userId),
      consumedAt: null,
      invalidatedAt: null,
      expiresAt: { $gt: now },
      attempts: { $lt: maxAttempts },
    },
    { $inc: { attempts: 1 } },
    { new: true },
  )
    .select('+codeHash')
    .exec();
}

export async function consumeChallenge(
  challengeId: string,
  codeHash: string,
  now: Date,
) {
  return TwoFactorChallengeModel.findOneAndUpdate(
    {
      _id: oid(challengeId),
      consumedAt: null,
      invalidatedAt: null,
      expiresAt: { $gt: now },
      codeHash,
    },
    { $set: { consumedAt: now } },
    { new: true },
  ).exec();
}

export async function renewChallengeCode(
  challengeId: string,
  userId: string,
  data: RenewChallengeData,
) {
  return TwoFactorChallengeModel.findOneAndUpdate(
    {
      _id: oid(challengeId),
      userId: oid(userId),
      consumedAt: null,
      invalidatedAt: null,
      resendCount: { $lt: data.maxResends },
      lastSentAt: { $lte: new Date(data.now.getTime() - data.minIntervalMs) },
    },
    {
      $set: {
        codeHash: data.codeHash,
        expiresAt: data.expiresAt,
        lastSentAt: data.now,
        attempts: 0,
      },
      $inc: { resendCount: 1 },
    },
    { new: true },
  ).exec();
}