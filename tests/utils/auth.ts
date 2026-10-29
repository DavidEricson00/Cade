import { randomUUID } from 'node:crypto';
import type { SuperTest, Test } from 'supertest';
import { signToken } from '../../src/config/jwt';
import { registerUser } from '../../src/services/auth.service';
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
 * Registra e autentica um usuário via chamadas HTTP reais na API.
 */
export async function registerAndLoginViaApi(
  client: SuperTest<Test>,
  overrides: Partial<User> = {},
): Promise<AuthSession> {
  const userData = makeUserData(overrides);

  const registerRes = await client
    .post('/auth/register')
    .send(userData)
    .expect(201);

  const loginRes = await client
    .post('/auth/login')
    .send({
      email: userData.email,
      password: userData.password,
    })
    .expect(200);

  const token = loginRes.body.data.token as string;

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
