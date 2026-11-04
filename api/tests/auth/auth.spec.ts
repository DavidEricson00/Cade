import jwt from 'jsonwebtoken';
import { createTestClient } from '../utils/app';
import {
  setupTestDatabase,
  clearTestDatabase,
  teardownTestDatabase,
} from '../utils/database';
import { makeUserData } from '../utils/factories';
import {
  generateValidToken,
  lastSentCode,
  wrongCodeFor,
  loginWithTwoFactor,
  type SendTwoFactorEmailMock,
} from '../utils/auth';
import * as userRepository from '../../src/repositories/user.repository';
import { sendTwoFactorCodeEmail } from '../../src/services/email.service';
import { TwoFactorChallengeModel } from '../../src/models/twoFactorChallenge.model';

// Nenhum e-mail real é enviado: o service é substituído por um mock
jest.mock('../../src/services/email.service');

const sendMock = sendTwoFactorCodeEmail as SendTwoFactorEmailMock;

describe('Suíte de Autenticação (Auth)', () => {
  const client = createTestClient();

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
    sendMock.mockReset();
    sendMock.mockResolvedValue(undefined);
  });

  /** Registra um usuário e executa o passo 1 do login (retorna challengeToken). */
  async function registerAndStartLogin(password = 'password123') {
    const user = makeUserData({ password });
    await client.post('/auth/register').send(user).expect(201);

    const res = await client
      .post('/auth/login')
      .send({ email: user.email, password })
      .expect(200);

    return {
      user,
      challengeToken: res.body.data.challengeToken as string,
      code: lastSentCode(sendMock),
    };
  }

  const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

  describe('Cadastro — POST /auth/register', () => {
    it('deve cadastrar um usuário com dados válidos com sucesso', async () => {
      const user = makeUserData({
        name: 'Maria Silva',
        email: 'maria@example.com',
        password: 'password123',
      });

      const response = await client
        .post('/auth/register')
        .send(user)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        code: 201,
        message: 'Usuário cadastrado com sucesso',
        data: {
          name: 'Maria Silva',
          email: 'maria@example.com',
        },
      });

      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.password).toBeUndefined();
    });

    it('não deve expor senha ou campos sensíveis no payload de resposta', async () => {
      const user = makeUserData({ password: 'secretPassword123' });

      const response = await client
        .post('/auth/register')
        .send(user)
        .expect(201);

      expect(response.body.data).not.toHaveProperty('password');
      expect(response.body.data).not.toHaveProperty('hash');
      expect(JSON.stringify(response.body)).not.toContain('secretPassword123');
    });

    it('deve normalizar nome e e-mail com espaços nas extremidades', async () => {
      const user = makeUserData({
        name: '   Carlos Alberto   ',
        email: '   CARLOS@EXAMPLE.COM   ',
        password: 'password123',
      });

      const response = await client
        .post('/auth/register')
        .send(user)
        .expect(201);

      expect(response.body.data.name).toBe('Carlos Alberto');
      expect(response.body.data.email).toBe('carlos@example.com');
    });

    it('deve retornar 400 se o corpo da requisição estiver vazio', async () => {
      const response = await client
        .post('/auth/register')
        .send({})
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        code: 400,
        message: 'Dados inválidos',
      });
    });

    it('deve retornar 400 se campos obrigatórios estiverem ausentes', async () => {
      const response = await client
        .post('/auth/register')
        .send({ name: 'Maria' })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        code: 400,
        message: 'Dados inválidos',
      });
    });

    it('deve retornar 400 se o nome tiver menos de 2 caracteres', async () => {
      const response = await client
        .post('/auth/register')
        .send(makeUserData({ name: 'A' }))
        .expect(400);

      expect(response.body.code).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar 400 se o nome for apenas espaços em branco', async () => {
      const response = await client
        .post('/auth/register')
        .send(makeUserData({ name: '   ' }))
        .expect(400);

      expect(response.body.code).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar 400 se o e-mail for inválido', async () => {
      const response = await client
        .post('/auth/register')
        .send(makeUserData({ email: 'email-invalido' }))
        .expect(400);

      expect(response.body.code).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar 400 se a senha tiver menos de 8 caracteres', async () => {
      const response = await client
        .post('/auth/register')
        .send(makeUserData({ password: '1234567' }))
        .expect(400);

      expect(response.body.code).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar 400 se a senha for vazia', async () => {
      const response = await client
        .post('/auth/register')
        .send(makeUserData({ password: '' }))
        .expect(400);

      expect(response.body.code).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deve tratar e-mail duplicado de acordo com o comportamento real do controller (500)', async () => {
      const user = makeUserData({ email: 'duplicado@example.com' });

      await client.post('/auth/register').send(user).expect(201);

      // O controller atual trata EmailAlreadyRegisteredError dentro do catch genérico e devolve 500
      const duplicateRes = await client
        .post('/auth/register')
        .send(user)
        .expect(500);

      expect(duplicateRes.body).toMatchObject({
        success: false,
        code: 500,
        message: 'Erro interno',
      });
    });

    it('deve retornar 500 em caso de falha de persistência no repositório', async () => {
      jest
        .spyOn(userRepository, 'createUser')
        .mockRejectedValueOnce(new Error('Erro de conexão com o banco'));

      const response = await client
        .post('/auth/register')
        .send(makeUserData())
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        code: 500,
        message: 'Erro interno',
      });
    });
  });

  describe('Login (etapa 1) — POST /auth/login', () => {
    it('deve aceitar credenciais válidas, exigir 2FA e enviar o código por e-mail', async () => {
      const user = makeUserData({
        email: 'login_valido@example.com',
        password: 'password123',
      });
      await client.post('/auth/register').send(user).expect(201);

      const response = await client
        .post('/auth/login')
        .send({ email: 'login_valido@example.com', password: 'password123' })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        code: 200,
        message: 'Código de verificação enviado para o e-mail cadastrado',
        data: { twoFactorRequired: true },
      });
      expect(typeof response.body.data.challengeToken).toBe('string');
      expect(response.body.data.expiresIn).toEqual(expect.any(Number));

      expect(sendMock).toHaveBeenCalledTimes(1);
      expect(sendMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'login_valido@example.com',
          code: expect.stringMatching(/^\d{6}$/),
        }),
      );
    });

    it('não deve emitir o JWT final nem vazar o código na resposta do login', async () => {
      const { challengeToken, code } = await registerAndStartLogin();

      const response = await client
        .post('/auth/login')
        .send({
          email: (await userRepository.findUserById)
            ? undefined
            : undefined,
        })
        .catch(() => null);
      void response;

      // Reexecuta o login de forma explícita para inspecionar o payload
      const user = makeUserData({ password: 'secretPassword123' });
      await client.post('/auth/register').send(user).expect(201);
      const res = await client
        .post('/auth/login')
        .send({ email: user.email, password: user.password })
        .expect(200);

      expect(res.body.data).not.toHaveProperty('token');
      expect(res.body.data).not.toHaveProperty('password');
      expect(JSON.stringify(res.body)).not.toContain('secretPassword123');
      expect(JSON.stringify(res.body)).not.toContain(lastSentCode(sendMock));
      expect(challengeToken).toBeTruthy();
      expect(code).toMatch(/^\d{6}$/);
    });

    it('deve permitir login com e-mail case-insensitive e com espaços', async () => {
      const user = makeUserData({
        email: 'usuario.caixa.alta@example.com',
        password: 'password123',
      });
      await client.post('/auth/register').send(user).expect(201);

      const response = await client
        .post('/auth/login')
        .send({
          email: '   USUARIO.CAIXA.ALTA@EXAMPLE.COM   ',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.data.challengeToken).toBeDefined();
      expect(sendMock).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'usuario.caixa.alta@example.com' }),
      );
    });

    it('deve retornar 400 se o corpo da requisição for vazio', async () => {
      const response = await client.post('/auth/login').send({}).expect(400);

      expect(response.body).toMatchObject({
        success: false,
        code: 400,
        message: 'E-mail ou senha inválidos',
      });
      expect(sendMock).not.toHaveBeenCalled();
    });

    it('deve retornar 400 se campos estiverem ausentes', async () => {
      const response = await client
        .post('/auth/login')
        .send({ email: 'teste@example.com' })
        .expect(400);

      expect(response.body.code).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar 400 se o formato do e-mail for inválido', async () => {
      const response = await client
        .post('/auth/login')
        .send({ email: 'nao-e-email', password: 'password123' })
        .expect(400);

      expect(response.body.code).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar 400 se a senha for vazia', async () => {
      const response = await client
        .post('/auth/login')
        .send({ email: 'teste@example.com', password: '' })
        .expect(400);

      expect(response.body.code).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar 401 se o usuário não existir e não enviar e-mail', async () => {
      const response = await client
        .post('/auth/login')
        .send({ email: 'inexistente@example.com', password: 'password123' })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        code: 401,
        message: 'E-mail ou senha inválidos',
      });
      expect(sendMock).not.toHaveBeenCalled();
    });

    it('deve retornar 401 se a senha estiver incorreta e não enviar e-mail', async () => {
      const user = makeUserData({ password: 'passwordCorreta' });
      await client.post('/auth/register').send(user).expect(201);

      const response = await client
        .post('/auth/login')
        .send({ email: user.email, password: 'senhaErrada123' })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        code: 401,
        message: 'E-mail ou senha inválidos',
      });
      expect(sendMock).not.toHaveBeenCalled();
    });

    it('deve retornar 503 e invalidar o desafio se o envio do e-mail falhar', async () => {
      const user = makeUserData({ password: 'password123' });
      await client.post('/auth/register').send(user).expect(201);

      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      sendMock.mockRejectedValueOnce(new Error('smtp indisponível'));

      const response = await client
        .post('/auth/login')
        .send({ email: user.email, password: 'password123' })
        .expect(503);

      expect(response.body).toMatchObject({
        success: false,
        code: 503,
        message: 'Não foi possível enviar o código. Tente novamente em instantes.',
      });

      const active = await TwoFactorChallengeModel.countDocuments({
        consumedAt: null,
        invalidatedAt: null,
      });
      expect(active).toBe(0);

      errorSpy.mockRestore();
    });
  });

  describe('Verificação 2FA — POST /auth/2fa/verify', () => {
    it('deve emitir o JWT final com o código correto', async () => {
      const { challengeToken, code } = await registerAndStartLogin();

      const response = await client
        .post('/auth/2fa/verify')
        .set(bearer(challengeToken))
        .send({ code })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        code: 200,
        message: 'Login realizado com sucesso',
      });

      const token = response.body.data.token;
      expect(typeof token).toBe('string');

      const decoded = jwt.decode(token) as { sub?: string };
      expect(decoded).toBeTruthy();
      expect(decoded.sub).toBeDefined();
    });

    it('deve retornar 401 sem header Authorization', async () => {
      const response = await client
        .post('/auth/2fa/verify')
        .send({ code: '123456' })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        code: 401,
        message: 'Token não informado',
      });
    });

    it('deve retornar 401 com challengeToken malformado', async () => {
      const response = await client
        .post('/auth/2fa/verify')
        .set(bearer('token_malformado'))
        .send({ code: '123456' })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        code: 401,
        message: 'Token inválido ou expirado',
      });
    });

    it('deve retornar 400 se o corpo for vazio ou o código tiver formato inválido', async () => {
      const { challengeToken } = await registerAndStartLogin();

      const empty = await client
        .post('/auth/2fa/verify')
        .set(bearer(challengeToken))
        .send({})
        .expect(400);
      expect(empty.body).toMatchObject({ code: 400, message: 'Código inválido' });

      const short = await client
        .post('/auth/2fa/verify')
        .set(bearer(challengeToken))
        .send({ code: '12' })
        .expect(400);
      expect(short.body.success).toBe(false);
    });

    it('deve retornar 401 com código errado', async () => {
      const { challengeToken, code } = await registerAndStartLogin();

      const response = await client
        .post('/auth/2fa/verify')
        .set(bearer(challengeToken))
        .send({ code: wrongCodeFor(code) })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        code: 401,
        message: 'Código inválido ou expirado',
      });
      expect(response.body.data?.token).toBeUndefined();
    });

    it('deve permitir usar o código apenas uma vez', async () => {
      const { challengeToken, code } = await registerAndStartLogin();

      await client
        .post('/auth/2fa/verify')
        .set(bearer(challengeToken))
        .send({ code })
        .expect(200);

      const second = await client
        .post('/auth/2fa/verify')
        .set(bearer(challengeToken))
        .send({ code })
        .expect(401);

      expect(second.body.message).toBe('Código inválido ou expirado');
    });

    it('deve retornar 401 quando o código estiver expirado', async () => {
      const { challengeToken, code } = await registerAndStartLogin();

      await TwoFactorChallengeModel.updateMany(
        {},
        { $set: { expiresAt: new Date(Date.now() - 1000) } },
      );

      const response = await client
        .post('/auth/2fa/verify')
        .set(bearer(challengeToken))
        .send({ code })
        .expect(401);

      expect(response.body.message).toBe('Código inválido ou expirado');
    });

    it('deve bloquear com 429 após 5 tentativas erradas, mesmo com o código correto', async () => {
      const { challengeToken, code } = await registerAndStartLogin();
      const wrong = wrongCodeFor(code);

      for (let i = 0; i < 5; i += 1) {
        await client
          .post('/auth/2fa/verify')
          .set(bearer(challengeToken))
          .send({ code: wrong })
          .expect(401);
      }

      const response = await client
        .post('/auth/2fa/verify')
        .set(bearer(challengeToken))
        .send({ code })
        .expect(429);

      expect(response.body).toMatchObject({
        success: false,
        code: 429,
        message: 'Muitas tentativas. Solicite um novo código.',
      });
    });

    it('um novo login deve invalidar o desafio anterior', async () => {
      const user = makeUserData({ password: 'password123' });
      await client.post('/auth/register').send(user).expect(201);

      const first = await client
        .post('/auth/login')
        .send({ email: user.email, password: 'password123' })
        .expect(200);
      const firstCode = lastSentCode(sendMock);

      await client
        .post('/auth/login')
        .send({ email: user.email, password: 'password123' })
        .expect(200);

      await client
        .post('/auth/2fa/verify')
        .set(bearer(first.body.data.challengeToken))
        .send({ code: firstCode })
        .expect(401);
    });
  });

  describe('Reenvio de código — POST /auth/2fa/resend', () => {
    it('deve retornar 401 sem header Authorization', async () => {
      const response = await client.post('/auth/2fa/resend').expect(401);

      expect(response.body).toMatchObject({
        success: false,
        code: 401,
        message: 'Token não informado',
      });
    });

    it('deve retornar 429 com Retry-After se reenviar antes do intervalo mínimo', async () => {
      const { challengeToken } = await registerAndStartLogin();

      const response = await client
        .post('/auth/2fa/resend')
        .set(bearer(challengeToken))
        .expect(429);

      expect(response.headers['retry-after']).toBeDefined();
      expect(response.body).toMatchObject({
        success: false,
        code: 429,
        message: 'Aguarde antes de solicitar um novo código.',
      });
      expect(response.body.data.retryAfter).toEqual(expect.any(Number));
      expect(sendMock).toHaveBeenCalledTimes(1);
    });

    it('deve reenviar um novo código após o intervalo e invalidar o código antigo', async () => {
      const { challengeToken, code: oldCode } = await registerAndStartLogin();

      // Simula a passagem de 61s sem precisar de fake timers
      await TwoFactorChallengeModel.updateMany(
        {},
        { $set: { lastSentAt: new Date(Date.now() - 61_000) } },
      );

      const resend = await client
        .post('/auth/2fa/resend')
        .set(bearer(challengeToken))
        .expect(200);

      expect(resend.body).toMatchObject({
        success: true,
        code: 200,
        message: 'Novo código enviado para o e-mail cadastrado',
      });
      expect(resend.body.data.challengeToken).toBeDefined();
      expect(resend.body.data.retryAfter).toBe(60);
      expect(sendMock).toHaveBeenCalledTimes(2);

      const newCode = lastSentCode(sendMock);

      if (newCode !== oldCode) {
        await client
          .post('/auth/2fa/verify')
          .set(bearer(resend.body.data.challengeToken))
          .send({ code: oldCode })
          .expect(401);
      }

      await client
        .post('/auth/2fa/verify')
        .set(bearer(resend.body.data.challengeToken))
        .send({ code: newCode })
        .expect(200);
    });

    it('deve retornar 429 ao atingir o limite de reenvios', async () => {
      const { challengeToken } = await registerAndStartLogin();

      await TwoFactorChallengeModel.updateMany(
        {},
        {
          $set: {
            resendCount: 3,
            lastSentAt: new Date(Date.now() - 61_000),
          },
        },
      );

      const response = await client
        .post('/auth/2fa/resend')
        .set(bearer(challengeToken))
        .expect(429);

      expect(response.body.message).toBe(
        'Limite de reenvios atingido. Faça login novamente.',
      );
    });

    it('deve retornar 401 se o desafio tiver sido consumido', async () => {
      const { challengeToken, code } = await registerAndStartLogin();

      await client
        .post('/auth/2fa/verify')
        .set(bearer(challengeToken))
        .send({ code })
        .expect(200);

      await client
        .post('/auth/2fa/resend')
        .set(bearer(challengeToken))
        .expect(401);
    });
  });

  describe('Middleware de Autenticação — Verificação de rotas protegidas', () => {
    // Usaremos DELETE /items/:id como rota protegida de teste
    const protectedRoute = '/items/algum-id-qualquer';

    it('deve rejeitar com 401 quando nenhum header Authorization for enviado', async () => {
      const response = await client.delete(protectedRoute).expect(401);

      expect(response.body).toMatchObject({
        success: false,
        code: 401,
        message: 'Token não informado',
      });
    });

    it('deve rejeitar com 401 quando o header não contiver o prefixo "Bearer "', async () => {
      const response = await client
        .delete(protectedRoute)
        .set('Authorization', generateValidToken())
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        code: 401,
        message: 'Token não informado',
      });
    });

    it('deve rejeitar com 401 quando o token for vazio após o prefixo Bearer', async () => {
      const response = await client
        .delete(protectedRoute)
        .set('Authorization', 'Bearer ')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        code: 401,
        message: 'Token não informado',
      });
    });

    it('deve rejeitar com 401 quando o token for malformado', async () => {
      const response = await client
        .delete(protectedRoute)
        .set('Authorization', 'Bearer token_invalido_e_malformado')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        code: 401,
        message: 'Token inválido ou expirado',
      });
    });

    it('deve rejeitar com 401 quando o token estiver expirado', async () => {
      const secret = process.env.JWT_SECRET as string;
      const expiredToken = jwt.sign({ sub: 'user-123' }, secret, {
        expiresIn: '-1s',
      });

      const response = await client
        .delete(protectedRoute)
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        code: 401,
        message: 'Token inválido ou expirado',
      });
    });

    it('deve rejeitar com 401 quando o token for assinado com segredo diferente', async () => {
      const tokenWithWrongSecret = jwt.sign(
        { sub: 'user-123' },
        'outro-segredo-completamente-diferente-123',
        { expiresIn: '1h' },
      );

      const response = await client
        .delete(protectedRoute)
        .set('Authorization', `Bearer ${tokenWithWrongSecret}`)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        code: 401,
        message: 'Token inválido ou expirado',
      });
    });

    it('deve rejeitar o challengeToken (etapa 1 do 2FA) em rotas protegidas', async () => {
      // Garante que quem só passou pela senha NÃO acessa rotas protegidas
      const { challengeToken } = await registerAndStartLogin();

      const response = await client
        .delete(protectedRoute)
        .set(bearer(challengeToken))
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe(401);
    });

    it('deve autorizar e passar pelo middleware quando o token for válido', async () => {
      const validToken = generateValidToken('user-valido-123');

      // Com token válido, passa pela autenticação e atinge a rota (404 porque o item não existe)
      const response = await client
        .delete(protectedRoute)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(404);

      expect(response.status).not.toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        code: 404,
        message: 'Item não encontrado',
      });
    });

    it('deve autorizar o token final obtido pelo fluxo completo de login + 2FA', async () => {
      const user = makeUserData({ password: 'password123' });
      await client.post('/auth/register').send(user).expect(201);

      const { token } = await loginWithTwoFactor(
        client,
        sendMock,
        user.email,
        user.password,
      );

      await client
        .delete(protectedRoute)
        .set(bearer(token))
        .expect(404);
    });
  });
});