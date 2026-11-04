import { apiRequest } from './client';
import type { LoginResult, RegisteredUser, ResendResult, VerifyResult } from './types';

export async function register(data: { name: string; email: string; password: string }) {
  const res = await apiRequest<RegisteredUser>('/auth/register', {
    method: 'POST',
    json: data,
    auth: 'none',
  });
  return res.data as RegisteredUser;
}

export async function login(data: { email: string; password: string }) {
  const res = await apiRequest<LoginResult>('/auth/login', {
    method: 'POST',
    json: data,
    auth: 'none',
  });
  return res.data as LoginResult;
}

export async function verifyTwoFactor(challengeToken: string, code: string) {
  const res = await apiRequest<VerifyResult>('/auth/2fa/verify', {
    method: 'POST',
    json: { code },
    auth: { challengeToken },
  });
  return res.data as VerifyResult;
}

export async function resendTwoFactor(challengeToken: string) {
  const res = await apiRequest<ResendResult>('/auth/2fa/resend', {
    method: 'POST',
    auth: { challengeToken },
  });
  return res.data as ResendResult;
}

