import { createTestClient } from '../utils/app';
import { generateValidToken, getAuthHeader } from '../utils/auth';
import {
  setupTestDatabase,
  clearTestDatabase,
  teardownTestDatabase,
} from '../utils/database';
import { requestLogs } from '../../src/data/request-logs';
import * as requestLogService from '../../src/services/requestLog.service';

describe('Suíte de Logs (Request Logs)', () => {
  const client = createTestClient();
  const validToken = generateValidToken();
  const authHeader = getAuthHeader(validToken);

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    // Limpa o array em memória de logs e banco antes de cada teste
    requestLogs.length = 0;
    await clearTestDatabase();
    jest.restoreAllMocks();
  });

  describe('Autenticação da rota de logs — GET /logs/:date', () => {
    it('deve retornar 401 quando o token não for enviado', async () => {
      const response = await client.get('/logs/2026-09-15').expect(401);

      expect(response.body).toMatchObject({
        success: false,
        code: 401,
        message: 'Token não informado',
      });
    });

    it('deve retornar 401 quando o token for inválido', async () => {
      const response = await client
        .get('/logs/2026-09-15')
        .set('Authorization', 'Bearer token_invalido')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        code: 401,
        message: 'Token inválido ou expirado',
      });
    });

    it('deve autorizar o acesso quando um token válido for fornecido', async () => {
      const response = await client
        .get('/logs/2026-09-15')
        .set(authHeader)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.code).toBe(200);
    });
  });

  describe('Consulta de Logs por Data — GET /logs/:date', () => {
    it('deve retornar logs correspondentes à data solicitada com estrutura correta', async () => {
      // Insere logs determinísticos no array em memória
      requestLogs.push(
        {
          id: 'log-1',
          method: 'GET',
          route: '/items',
          timestamp: '2026-09-15T10:00:00.000Z',
          timezone: 'UTC',
        },
        {
          id: 'log-2',
          method: 'POST',
          route: '/items',
          timestamp: '2026-09-15T15:30:00.000Z',
          timezone: 'UTC',
        },
        {
          id: 'log-outro-dia',
          method: 'GET',
          route: '/items',
          timestamp: '2026-09-16T08:00:00.000Z',
          timezone: 'UTC',
        },
      );

      const response = await client
        .get('/logs/2026-09-15')
        .set(authHeader)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        code: 200,
        message: 'Logs consultados com sucesso',
        meta: {
          date: '2026-09-15',
          timezone: 'UTC',
          total: 2,
        },
      });

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(2);

      const ids = response.body.data.map((l: { id: string }) => l.id);
      expect(ids).toContain('log-1');
      expect(ids).toContain('log-2');
      expect(ids).not.toContain('log-outro-dia');
    });

    it('deve retornar lista vazia e total 0 quando não houver logs para a data', async () => {
      requestLogs.push({
        id: 'log-outro',
        method: 'GET',
        route: '/items',
        timestamp: '2026-01-01T12:00:00.000Z',
      });

      const response = await client
        .get('/logs/2026-09-15')
        .set(authHeader)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        code: 200,
        meta: {
          date: '2026-09-15',
          timezone: 'UTC',
          total: 0,
        },
        data: [],
      });
    });

    it('deve utilizar "UTC" como timezone padrão na ausência de header x-timezone', async () => {
      const response = await client
        .get('/logs/2026-09-15')
        .set(authHeader)
        .expect(200);

      expect(response.body.meta.timezone).toBe('UTC');
    });

    it('deve utilizar o timezone informado via header x-timezone válido', async () => {
      // No cálculo da API:
      // log-no-inicio (2026-09-15T01:00:00.000Z) pertence ao intervalo de America/Fortaleza
      // log-no-fim (2026-09-16T01:00:00.000Z) está fora do intervalo de America/Fortaleza
      requestLogs.push(
        {
          id: 'log-no-inicio-fortaleza',
          method: 'GET',
          route: '/items',
          timestamp: '2026-09-15T01:00:00.000Z',
        },
        {
          id: 'log-no-fim-fora-de-fortaleza',
          method: 'GET',
          route: '/items',
          timestamp: '2026-09-16T01:00:00.000Z',
        },
      );

      const response = await client
        .get('/logs/2026-09-15')
        .set(authHeader)
        .set('x-timezone', 'America/Fortaleza')
        .expect(200);

      expect(response.body.meta.timezone).toBe('America/Fortaleza');
      expect(response.body.meta.total).toBe(1);
      expect(response.body.data[0].id).toBe('log-no-inicio-fortaleza');
    });

    it('deve tratar header x-timezone com espaços nas extremidades aplicando trim', async () => {
      const response = await client
        .get('/logs/2026-09-15')
        .set(authHeader)
        .set('x-timezone', '   America/Fortaleza   ')
        .expect(200);

      expect(response.body.meta.timezone).toBe('America/Fortaleza');
    });

    it('deve retornar UTC quando o header x-timezone for vazio ou apenas espaços', async () => {
      const response = await client
        .get('/logs/2026-09-15')
        .set(authHeader)
        .set('x-timezone', '   ')
        .expect(200);

      expect(response.body.meta.timezone).toBe('UTC');
    });

    it('deve retornar 400 se o x-timezone for inválido', async () => {
      const response = await client
        .get('/logs/2026-09-15')
        .set(authHeader)
        .set('x-timezone', 'Timezone/Invalido_Nao_Existe')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        code: 400,
        message: expect.stringContaining('Timezone inválido'),
      });
    });

    it('deve retornar 400 se a data for malformada', async () => {
      const response = await client
        .get('/logs/15-09-2026')
        .set(authHeader)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        code: 400,
        message: expect.stringContaining('Data inválida'),
      });
    });

    it('comportamento com datas impossíveis (como 2026-02-30): Date.parse do JavaScript interpreta como 2 de março', async () => {
      // No V8/Node.js, Date.parse("2026-02-30") retorna timestamp válido (não NaN),
      // passando pela verificação DATE_REGEX e !isNaN(Date.parse(date)) atual.
      const response = await client
        .get('/logs/2026-02-30')
        .set(authHeader);

      expect(response.status).toBe(200);
      expect(response.body.meta.date).toBe('2026-02-30');
    });

    it('deve garantir que meta.total seja coerente com a quantidade real de itens em data', async () => {
      requestLogs.push(
        {
          id: 'log-a',
          method: 'GET',
          route: '/items',
          timestamp: '2026-09-15T09:00:00.000Z',
        },
        {
          id: 'log-b',
          method: 'GET',
          route: '/items/123',
          timestamp: '2026-09-15T11:00:00.000Z',
        },
        {
          id: 'log-c',
          method: 'DELETE',
          route: '/items/123',
          timestamp: '2026-09-15T14:00:00.000Z',
        },
      );

      const response = await client
        .get('/logs/2026-09-15')
        .set(authHeader)
        .expect(200);

      expect(response.body.meta.total).toBe(response.body.data.length);
      expect(response.body.meta.total).toBe(3);
    });

    it('deve reproduzir falha de consulta de forma controlada', async () => {
      jest
        .spyOn(requestLogService, 'getLogsByDate')
        .mockImplementationOnce(() => {
          throw new Error('Falha no serviço de logs');
        });

      // No controller getLogs atual, não há bloco try/catch em torno de getLogsByDate,
      // portanto um erro síncrono é tratado pelo handler padrão de erro do Express (500)
      const response = await client
        .get('/logs/2026-09-15')
        .set(authHeader)
        .expect(500);

      expect(response.status).toBe(500);
    });
  });
});
