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
  getAuthHeader,
  createAuthenticatedUser,
} from '../utils/auth';
import * as userRepository from '../../src/repositories/user.repository';

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
  });

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
      const user = makeUserData({ name: 'A' });

      const response = await client
        .post('/auth/register')
        .send(user)
        .expect(400);

      expect(response.body.code).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar 400 se o nome for apenas espaços em branco', async () => {
      const user = makeUserData({ name: '   ' });

      const response = await client
        .post('/auth/register')
        .send(user)
        .expect(400);

      expect(response.body.code).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar 400 se o e-mail for inválido', async () => {
      const user = makeUserData({ email: 'email-invalido' });

      const response = await client
        .post('/auth/register')
        .send(user)
        .expect(400);

      expect(response.body.code).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar 400 se a senha tiver menos de 8 caracteres', async () => {
      const user = makeUserData({ password: '1234567' });

      const response = await client
        .post('/auth/register')
        .send(user)
        .expect(400);

      expect(response.body.code).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar 400 se a senha for vazia', async () => {
      const user = makeUserData({ password: '' });

      const response = await client
        .post('/auth/register')
        .send(user)
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
      const user = makeUserData();

      jest
        .spyOn(userRepository, 'createUser')
        .mockRejectedValueOnce(new Error('Erro de conexão com o banco'));

      const response = await client
        .post('/auth/register')
        .send(user)
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        code: 500,
        message: 'Erro interno',
      });
    });
  });

  describe('Login — POST /auth/login', () => {
    it('deve autenticar credenciais válidas e retornar token JWT', async () => {
      const rawPassword = 'password123';
      const user = makeUserData({
        email: 'login_valido@example.com',
        password: rawPassword,
      });

      await client.post('/auth/register').send(user).expect(201);

      const response = await client
        .post('/auth/login')
        .send({
          email: 'login_valido@example.com',
          password: rawPassword,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        code: 200,
        message: 'Login realizado com sucesso',
      });

      expect(response.body.data).toHaveProperty('token');
      const token = response.body.data.token;
      expect(typeof token).toBe('string');

      const decoded = jwt.decode(token) as { sub?: string };
      expect(decoded).toBeTruthy();
      expect(decoded.sub).toBeDefined();
    });

    it('não deve expor a senha ou dados sensíveis na resposta do login', async () => {
      const user = makeUserData({ password: 'secretPassword123' });
      await client.post('/auth/register').send(user).expect(201);

      const response = await client
        .post('/auth/login')
        .send({
          email: user.email,
          password: user.password,
        })
        .expect(200);

      expect(response.body.data).not.toHaveProperty('password');
      expect(JSON.stringify(response.body)).not.toContain('secretPassword123');
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

      expect(response.body.data.token).toBeDefined();
    });

    it('deve retornar 400 se o corpo da requisição for vazio', async () => {
      const response = await client
        .post('/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        code: 400,
        message: 'E-mail ou senha inválidos',
      });
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

    it('deve retornar 403 se o usuário não existir no banco', async () => {
      const response = await client
        .post('/auth/login')
        .send({
          email: 'inexistente@example.com',
          password: 'password123',
        })
        .expect(403);

      expect(response.body).toMatchObject({
        success: false,
        code: 403,
        message: 'E-mail ou senha inválidos',
      });
    });

    it('deve retornar 403 se a senha estiver incorreta', async () => {
      const user = makeUserData({ password: 'passwordCorreta' });
      await client.post('/auth/register').send(user).expect(201);

      const response = await client
        .post('/auth/login')
        .send({
          email: user.email,
          password: 'senhaErrada123',
        })
        .expect(403);

      expect(response.body).toMatchObject({
        success: false,
        code: 403,
        message: 'E-mail ou senha inválidos',
      });
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
      const token = generateValidToken();
      const response = await client
        .delete(protectedRoute)
        .set('Authorization', token)
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
      const wrongSecret = 'outro-segredo-completamente-diferente-123';
      const tokenWithWrongSecret = jwt.sign({ sub: 'user-123' }, wrongSecret, {
        expiresIn: '1h',
      });

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

    it('deve autorizar e passar pelo middleware quando o token for válido', async () => {
      const validToken = generateValidToken('user-valido-123');

      // Com token válido, passa pela autenticação e atinge a rota (retornará 404 porque o item não existe, não 401)
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
  });
});
