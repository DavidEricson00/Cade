import { randomUUID } from 'node:crypto';
import type { SuperTest, Test } from 'supertest';
import { signToken } from '../../src/config/jwt';
import { registerUser } from '../../src/services/auth.service';
import type { sendTwoFactorCodeEmail } from '../../src/services/email.service';
import { makeUserData } from './factories';
import type { User } from '../../src/types/user';

export interface AuthSession {
  token: string;
  authHeader: { Authorization: string };
  user: {
    id: string;
    name: string;
    email: string;
    rawPassword: string;
  };
}

/** Tipo do mock de envio de e-mail 2FA (jest.mock('.../email.service')). */
export type SendTwoFactorEmailMock = jest.MockedFunction<
  typeof sendTwoFactorCodeEmail
>;

/**
 * Gera diretamente um token JWT válido sem requisições HTTP adicionais.
 */
export function generateValidToken(userId: string = randomUUID()): string {
  return signToken(userId);
}

/**
 * Retorna o cabeçalho Authorization formatado com Bearer token.
 */
export function getAuthHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

/**
 * Cria um usuário diretamente no banco via service e gera o JWT correspondente,
 * permitindo preparar autenticação rapidamente sem chamadas HTTP redundantes.
 */
export async function createAuthenticatedUser(
  overrides: Partial<User> = {},
): Promise<AuthSession> {
  const userData = makeUserData(overrides);
  const created = await registerUser(userData);
  const token = generateValidToken(created.id);

  return {
    token,
    authHeader: getAuthHeader(token),
    user: {
      ...created,
      rawPassword: userData.password,
    },
  };
}

/**
 * Retorna o código 2FA do último e-mail "enviado" (capturado pelo mock).
 */
export function lastSentCode(sendMock: SendTwoFactorEmailMock): string {
  const calls = sendMock.mock.calls;

  if (calls.length === 0) {
    throw new Error('Nenhum e-mail 2FA foi enviado (mock sem chamadas)');
  }

  return calls[calls.length - 1][0].code;
}

/**
 * Gera um código de 6 dígitos garantidamente diferente do informado.
 */
export function wrongCodeFor(code: string): string {
  return code === '111111' ? '222222' : '111111';
}

/**
 * Fluxo completo de login com 2FA via HTTP:
 * login -> captura código do mock -> verify -> token final.
 */
export async function loginWithTwoFactor(
  client: SuperTest<Test>,
  sendMock: SendTwoFactorEmailMock,
  email: string,
  password: string,
): Promise<{ token: string; challengeToken: string }> {
  const loginRes = await client
    .post('/auth/login')
    .send({ email, password })
    .expect(200);

  const challengeToken = loginRes.body.data.challengeToken as string;

  const verifyRes = await client
    .post('/auth/2fa/verify')
    .set('Authorization', `Bearer ${challengeToken}`)
    .send({ code: lastSentCode(sendMock) })
    .expect(200);

  return { token: verifyRes.body.data.token as string, challengeToken };
}

/**
 * Registra e autentica um usuário via chamadas HTTP reais na API (incluindo 2FA).
 */
export async function registerAndLoginViaApi(
  client: SuperTest<Test>,
  sendMock: SendTwoFactorEmailMock,
  overrides: Partial<User> = {},
): Promise<AuthSession> {
  const userData = makeUserData(overrides);

  const registerRes = await client
    .post('/auth/register')
    .send(userData)
    .expect(201);

  const { token } = await loginWithTwoFactor(
    client,
    sendMock,
    userData.email,
    userData.password,
  );

  return {
    token,
    authHeader: getAuthHeader(token),
    user: {
      id: registerRes.body.data.id,
      name: registerRes.body.data.name,
      email: registerRes.body.data.email,
      rawPassword: userData.password,
    },
  };
}