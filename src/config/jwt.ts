import jwt from 'jsonwebtoken';

export const CHALLENGE_PURPOSE = '2fa_challenge';
export const CHALLENGE_EXPIRES_IN_SECONDS = 5 * 60;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET não definido');
  }

  return secret;
}

const expiresIn = (process.env.JWT_EXPIRES_IN ?? '1h') as jwt.SignOptions['expiresIn'];

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn });
}

export function signChallengeToken(userId: string, challengeId: string): string {
  return jwt.sign(
    { sub: userId, cid: challengeId, purpose: CHALLENGE_PURPOSE },
    getJwtSecret(),
    { expiresIn: CHALLENGE_EXPIRES_IN_SECONDS, algorithm: 'HS256' },
  );
}

export function verifyChallengeToken(token: string): {
  userId: string;
  challengeId: string;
} {
  const payload = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });

  if (
    typeof payload === 'string' ||
    payload.purpose !== CHALLENGE_PURPOSE ||
    typeof payload.sub !== 'string' ||
    typeof payload.cid !== 'string'
  ) {
    throw new Error('Token inválido');
  }

  return { userId: payload.sub, challengeId: payload.cid };
}