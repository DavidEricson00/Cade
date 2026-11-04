import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { Types } from 'mongoose';
import {
  CHALLENGE_EXPIRES_IN_SECONDS,
  signChallengeToken,
  signToken,
  verifyChallengeToken,
} from '../config/jwt';
import {
  consumeChallenge,
  createChallenge,
  findActiveChallenge,
  invalidateActiveChallenges,
  invalidateChallenge,
  registerAttempt,
  renewChallengeCode,
} from '../repositories/twoFactorChallenge.repository';
import { findUserById } from '../repositories/user.repository';
import { sendTwoFactorCodeEmail } from './email.service';

const CODE_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_RESENDS = 3;
const RESEND_INTERVAL_MS = 60 * 1000;

const INVALID_CODE_MESSAGE = 'Código inválido ou expirado';
const INVALID_TOKEN_MESSAGE = 'Token inválido ou expirado';

export class TwoFactorError extends Error {
  status: number;
  retryAfter?: number;

  constructor(status: number, message: string, retryAfter?: number) {
    super(message);
    this.name = 'TwoFactorError';
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

type ChallengeUser = {
  id: string;
  name: string;
  email: string;
};

function generateCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

function getCodeSecret(): string {
  const secret = process.env.TWO_FACTOR_CODE_SECRET;

  if (!secret) {
    throw new Error('TWO_FACTOR_CODE_SECRET não definido');
  }

  return secret;
}

// O id do desafio entra no HMAC, então o mesmo código gera hashes diferentes por desafio
function hashCode(challengeId: string, code: string): string {
  return createHmac('sha256', getCodeSecret())
    .update(`${challengeId}:${code}`)
    .digest('hex');
}

function safeEqualHex(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, 'hex');
  const bufferB = Buffer.from(b, 'hex');

  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

function parseChallengeToken(token: string) {
  try {
    return verifyChallengeToken(token);
  } catch {
    throw new TwoFactorError(401, INVALID_TOKEN_MESSAGE);
  }
}

async function deliverCode(user: ChallengeUser, code: string) {
  try {
    await sendTwoFactorCodeEmail({
      to: user.email,
      name: user.name,
      code,
      expiresInMinutes: CODE_TTL_MS / 60_000,
    });
  } catch (error) {
    console.error(
      '[2fa] falha no envio do e-mail:',
      error instanceof Error ? error.name : 'desconhecido',
    );
    throw new TwoFactorError(
      503,
      'Não foi possível enviar o código. Tente novamente em instantes.',
    );
  }
}

export async function startTwoFactorChallenge(user: ChallengeUser) {
  // Um novo login invalida qualquer desafio anterior do usuário
  await invalidateActiveChallenges(user.id);

  const challengeId = new Types.ObjectId();
  const code = generateCode();
  const now = new Date();

  await createChallenge({
    id: challengeId,
    userId: user.id,
    codeHash: hashCode(challengeId.toString(), code),
    expiresAt: new Date(now.getTime() + CODE_TTL_MS),
    lastSentAt: now,
  });

  try {
    await deliverCode(user, code);
  } catch (error) {
    await invalidateChallenge(challengeId.toString());
    throw error;
  }

  return {
    challengeToken: signChallengeToken(user.id, challengeId.toString()),
  };
}

export async function verifyTwoFactorCode(
  challengeToken: string,
  code: string,
): Promise<string> {
  const { userId, challengeId } = parseChallengeToken(challengeToken);
  const now = new Date();

  const challenge = await findActiveChallenge(challengeId, userId);

  if (!challenge || challenge.expiresAt <= now) {
    throw new TwoFactorError(401, INVALID_CODE_MESSAGE);
  }

  if (challenge.attempts >= MAX_ATTEMPTS) {
    throw new TwoFactorError(
      429,
      'Muitas tentativas. Solicite um novo código.',
    );
  }

  const attempted = await registerAttempt(
    challengeId,
    userId,
    MAX_ATTEMPTS,
    now,
  );

  if (!attempted) {
    throw new TwoFactorError(401, INVALID_CODE_MESSAGE);
  }

  const expectedHash = attempted.codeHash;

  if (!safeEqualHex(expectedHash, hashCode(challengeId, code))) {
    throw new TwoFactorError(401, INVALID_CODE_MESSAGE);
  }

  const consumed = await consumeChallenge(challengeId, expectedHash, now);

  if (!consumed) {
    throw new TwoFactorError(401, INVALID_CODE_MESSAGE);
  }

  return signToken(userId);
}

export async function resendTwoFactorCode(challengeToken: string) {
  const { userId, challengeId } = parseChallengeToken(challengeToken);
  const now = new Date();

  const challenge = await findActiveChallenge(challengeId, userId);

  if (!challenge) {
    throw new TwoFactorError(401, INVALID_TOKEN_MESSAGE);
  }

  if (challenge.resendCount >= MAX_RESENDS) {
    throw new TwoFactorError(
      429,
      'Limite de reenvios atingido. Faça login novamente.',
    );
  }

  const elapsed = now.getTime() - challenge.lastSentAt.getTime();

  if (elapsed < RESEND_INTERVAL_MS) {
    const retryAfter = Math.ceil((RESEND_INTERVAL_MS - elapsed) / 1000);
    throw new TwoFactorError(
      429,
      'Aguarde antes de solicitar um novo código.',
      retryAfter,
    );
  }

  const user = await findUserById(userId);

  if (!user) {
    throw new TwoFactorError(401, INVALID_TOKEN_MESSAGE);
  }

  const code = generateCode();

  const renewed = await renewChallengeCode(challengeId, userId, {
    codeHash: hashCode(challengeId, code),
    expiresAt: new Date(now.getTime() + CODE_TTL_MS),
    now,
    maxResends: MAX_RESENDS,
    minIntervalMs: RESEND_INTERVAL_MS,
  });

  if (!renewed) {
    throw new TwoFactorError(
      429,
      'Aguarde antes de solicitar um novo código.',
      Math.ceil(RESEND_INTERVAL_MS / 1000),
    );
  }

  await deliverCode({ id: user.id, name: user.name, email: user.email }, code);

  return {
    challengeToken: signChallengeToken(userId, challengeId),
    expiresIn: CHALLENGE_EXPIRES_IN_SECONDS,
    retryAfter: RESEND_INTERVAL_MS / 1000,
  };
}