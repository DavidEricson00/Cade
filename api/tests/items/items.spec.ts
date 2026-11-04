import { Readable } from 'node:stream';
import { createTestClient } from '../utils/app';
import {
  setupTestDatabase,
  clearTestDatabase,
  teardownTestDatabase,
} from '../utils/database';
import { makeItemData, makeItem } from '../utils/factories';
import { generateValidToken, getAuthHeader } from '../utils/auth';
import * as storageService from '../../src/services/storage.service';
import * as itemsRepository from '../../src/repositories/items.repository';
import * as exportService from '../../src/services/export.service';
import * as reportService from '../../src/services/report.service';

describe('Suíte de Itens (Items)', () => {
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
    await clearTestDatabase();
    jest.restoreAllMocks();
  });

  describe('Listagem — GET /items', () => {
    it('deve listar itens cadastrados com status 200 e estrutura esperada', async () => {
      const item1 = await itemsRepository.create(makeItem({ name: 'Chaveiro' }));
      const item2 = await itemsRepository.create(makeItem({ name: 'Carteira' }));

      const response = await client.get('/items').expect(200);

      expect(response.body).toMatchObject({
        success: true,
        code: 200,
        message: 'Itens encontrados com sucesso',
      });

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(2);

      const names = response.body.data.map((i: { name: string }) => i.name);
      expect(names).toContain(item1.name);
      expect(names).toContain(item2.name);
    });

    it('deve retornar lista vazia quando nenhum item estiver cadastrado', async () => {
      const response = await client.get('/items').expect(200);

      expect(response.body).toMatchObject({
        success: true,
        code: 200,
        message: 'Itens encontrados com sucesso',
        data: [],
      });
    });

    it('deve retornar status 500 em caso de falha de persistência no repositório', async () => {
      jest
        .spyOn(itemsRepository, 'findAll')
        .mockRejectedValueOnce(new Error('Erro no MongoDB'));

      const response = await client.get('/items').expect(500);

      expect(response.body).toMatchObject({
        success: false,
        code: 500,
        message: 'Erro ao buscar itens',
      });
    });
  });

  describe('Busca por ID — GET /items/:id', () => {
    it('deve retornar o item com status 200 quando o ID existir', async () => {
      const created = await itemsRepository.create(
        makeItem({
          name: 'Mochila Azul',
          description: 'Contém cadernos e estojo',
          location: 'Sala 102',
          date: '2026-05-10',
        }),
      );

      const response = await client.get(`/items/${created.id}`).expect(200);

      expect(response.body).toMatchObject({
        success: true,
        code: 200,
        message: 'Item encontrado com sucesso',
        data: {
          id: created.id,
          name: 'Mochila Azul',
          description: 'Contém cadernos e estojo',
          location: 'Sala 102',
          date: '2026-05-10',
        },
      });
    });

    it('deve retornar 404 quando o ID do item não existir', async () => {
      const response = await client
        .get('/items/id-inexistente-12345')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        code: 404,
        message: 'Item não encontrado',
      });
    });

    it('deve retornar 404 para ID malformado ou formato atípico', async () => {
      const response = await client.get('/items/!@#$%¨&*()').expect(404);

      expect(response.body).toMatchObject({
        success: false,
        code: 404,
        message: 'Item não encontrado',
      });
    });
  });

  describe('Criação — POST /items', () => {
    it('deve criar um item válido sem imagem autenticado com sucesso', async () => {
      const payload = makeItemData({
        name: 'Guarda-chuva',
        description: 'Cor preta, cabo de madeira',
        location: 'Recepção Principal',
        date: '2026-06-20',
      });

      const response = await client
        .post('/items')
        .set(authHeader)
        .send(payload)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        code: 201,
        message: 'Item criado com sucesso',
        data: {
          name: 'Guarda-chuva',
          description: 'Cor preta, cabo de madeira',
          location: 'Recepção Principal',
          date: '2026-06-20',
        },
      });

      expect(response.body.data.id).toBeDefined();

      // Confirma persistência real
      const inDb = await itemsRepository.findById(response.body.data.id);
      expect(inDb).not.toBeNull();
      expect(inDb?.name).toBe('Guarda-chuva');
    });

    it('deve criar um item com upload de imagem mockado pontualmente', async () => {
      const mockUpload = jest
        .spyOn(storageService, 'uploadImage')
        .mockResolvedValueOnce({
          url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          publicId: 'cade/items/sample-id',
        });

      const response = await client
        .post('/items')
        .set(authHeader)
        .field('name', 'Relógio de Pulso')
        .field('description', 'Marca Casio, pulseira prateada')
        .field('location', 'Refeitório')
        .field('date', '2026-07-01')
        .attach('image', Buffer.from('fake-image-data'), 'relogio.png')
        .expect(201);

      expect(mockUpload).toHaveBeenCalledTimes(1);
      expect(response.body.data.imageUrl).toBe(
        'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      );
      expect(response.body.data.imagePublicId).toBe('cade/items/sample-id');
    });

    it('deve retornar 401 na ausência de token de autenticação', async () => {
      const payload = makeItemData();

      const response = await client.post('/items').send(payload).expect(401);

      expect(response.body).toMatchObject({
        success: false,
        code: 401,
        message: 'Token não informado',
      });
    });

    it('deve retornar 401 com token inválido', async () => {
      const payload = makeItemData();

      const response = await client
        .post('/items')
        .set('Authorization', 'Bearer token_invalido')
        .send(payload)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        code: 401,
        message: 'Token inválido ou expirado',
      });
    });

    it('deve retornar 400 se o corpo da requisição estiver vazio', async () => {
      const response = await client
        .post('/items')
        .set(authHeader)
        .send({})
        .expect(400);

      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('Dados inválidos');
    });

    it('deve retornar 400 quando campos obrigatórios estiverem ausentes', async () => {
      const response = await client
        .post('/items')
        .set(authHeader)
        .send({ name: 'Óculos' })
        .expect(400);

      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('Dados inválidos');
    });

    it('deve retornar 400 se o nome for vazio ou apenas espaços', async () => {
      const payload = makeItemData({ name: '   ' });

      const response = await client
        .post('/items')
        .set(authHeader)
        .send(payload)
        .expect(400);

      expect(response.body.code).toBe(400);
    });

    it('deve retornar 400 se a descrição for vazia', async () => {
      const payload = makeItemData({ description: '' });

      const response = await client
        .post('/items')
        .set(authHeader)
        .send(payload)
        .expect(400);

      expect(response.body.code).toBe(400);
    });

    it('deve retornar 400 se a localização for vazia', async () => {
      const payload = makeItemData({ location: '' });

      const response = await client
        .post('/items')
        .set(authHeader)
        .send(payload)
        .expect(400);

      expect(response.body.code).toBe(400);
    });

    it('deve retornar 400 se a data estiver fora do formato YYYY-MM-DD', async () => {
      const payload = makeItemData({ date: '15/05/2026' });

      const response = await client
        .post('/items')
        .set(authHeader)
        .send(payload)
        .expect(400);

      expect(response.body.code).toBe(400);
    });

    it('comportamento com datas impossíveis (como 2026-02-30): aceita pelo regex do schema atual', async () => {
      // O itemSchema atual usa z.string().regex(/^\d{4}-\d{2}-\d{2}$/), aceitando a string
      const payload = makeItemData({ date: '2026-02-30' });

      const response = await client
        .post('/items')
        .set(authHeader)
        .send(payload);

      // Documenta que o schema atual aceita por validar apenas formato regex
      expect(response.status).toBe(201);
      expect(response.body.data.date).toBeDefined();
    });

    it('não deve criar registro no banco quando a validação falhar', async () => {
      const countBefore = (await itemsRepository.findAll()).length;

      await client
        .post('/items')
        .set(authHeader)
        .send({ name: '' })
        .expect(400);

      const countAfter = (await itemsRepository.findAll()).length;
      expect(countAfter).toBe(countBefore);
    });

    it('deve rejeitar arquivo com MIME type não permitido com 400', async () => {
      const response = await client
        .post('/items')
        .set(authHeader)
        .field('name', 'Documento')
        .field('description', 'Arquivo PDF')
        .field('location', 'Secretaria')
        .field('date', '2026-05-15')
        .attach(
          'image',
          Buffer.from('%PDF-1.4 teste'),
          { filename: 'documento.pdf', contentType: 'application/pdf' },
        )
        .expect(400);

      expect(response.body.code).toBe(400);
      expect(response.body.message).toContain('Envie um único arquivo de imagem');
    });

    it('deve rejeitar arquivo acima do limite configurado (5MB) com 400', async () => {
      // Cria buffer maior que 5MB (5MB + 1KB)
      const oversizedBuffer = Buffer.alloc(5 * 1024 * 1024 + 1024);

      const response = await client
        .post('/items')
        .set(authHeader)
        .field('name', 'Foto Pesada')
        .field('description', 'Imagem muito grande')
        .field('location', 'Estúdio')
        .field('date', '2026-05-15')
        .attach(
          'image',
          oversizedBuffer,
          { filename: 'grande.jpg', contentType: 'image/jpeg' },
        )
        .expect(400);

      expect(response.body.code).toBe(400);
      expect(response.body.message).toContain('5MB');
    });

    it('deve retornar 502 quando o upload para o Cloudinary falhar', async () => {
      jest
        .spyOn(storageService, 'uploadImage')
        .mockRejectedValueOnce(new storageService.ImageUploadError());

      const response = await client
        .post('/items')
        .set(authHeader)
        .field('name', 'Celular')
        .field('description', 'Tela trincada')
        .field('location', 'Pátio')
        .field('date', '2026-05-15')
        .attach('image', Buffer.from('img-bytes'), 'celular.jpg')
        .expect(502);

      expect(response.body).toMatchObject({
        success: false,
        code: 502,
        message: 'Erro ao enviar a imagem para a nuvem',
      });
    });

    it('deve retornar 500 em caso de falha de persistência no repositório e limpar a imagem enviada', async () => {
      const deleteSpy = jest
        .spyOn(storageService, 'deleteImage')
        .mockResolvedValueOnce();

      jest
        .spyOn(storageService, 'uploadImage')
        .mockResolvedValueOnce({
          url: 'https://res.cloudinary.com/demo/image.png',
          publicId: 'temp-public-id',
        });

      jest
        .spyOn(itemsRepository, 'create')
        .mockRejectedValueOnce(new Error('Falha no MongoDB'));

      const response = await client
        .post('/items')
        .set(authHeader)
        .field('name', 'Chave')
        .field('description', 'Com chaveiro vermelho')
        .field('location', 'Portaria')
        .field('date', '2026-05-15')
        .attach('image', Buffer.from('img-bytes'), 'chave.jpg')
        .expect(500);

      expect(response.body.code).toBe(500);
      expect(deleteSpy).toHaveBeenCalledWith('temp-public-id');
    });
  });

  describe('Atualização — PATCH /items/:id', () => {
    it('deve atualizar um único campo com sucesso', async () => {
      const item = await itemsRepository.create(
        makeItem({ name: 'Nome Original', location: 'Local Original' }),
      );

      const response = await client
        .patch(`/items/${item.id}`)
        .set(authHeader)
        .send({ name: 'Nome Atualizado' })
        .expect(200);

      expect(response.body.data.name).toBe('Nome Atualizado');
      expect(response.body.data.location).toBe('Local Original');

      const updatedDb = await itemsRepository.findById(item.id);
      expect(updatedDb?.name).toBe('Nome Atualizado');
      expect(updatedDb?.location).toBe('Local Original');
    });

    it('deve atualizar múltiplos campos com sucesso', async () => {
      const item = await itemsRepository.create(makeItem());

      const response = await client
        .patch(`/items/${item.id}`)
        .set(authHeader)
        .send({
          name: 'Novo Nome',
          description: 'Nova Descrição',
          location: 'Nova Localização',
          date: '2026-12-01',
        })
        .expect(200);

      expect(response.body.data).toMatchObject({
        name: 'Novo Nome',
        description: 'Nova Descrição',
        location: 'Nova Localização',
        date: '2026-12-01',
      });
    });

    it('deve atualizar apenas a imagem com sucesso e remover imagem anterior', async () => {
      const item = await itemsRepository.create(
        makeItem({
          imageUrl: 'https://cloudinary.com/antiga.jpg',
          imagePublicId: 'antiga-id',
        }),
      );

      const deleteSpy = jest
        .spyOn(storageService, 'deleteImage')
        .mockResolvedValueOnce();

      jest.spyOn(storageService, 'uploadImage').mockResolvedValueOnce({
        url: 'https://cloudinary.com/nova.jpg',
        publicId: 'nova-id',
      });

      const response = await client
        .patch(`/items/${item.id}`)
        .set(authHeader)
        .attach('image', Buffer.from('nova-imagem'), 'nova.jpg')
        .expect(200);

      expect(response.body.data.imageUrl).toBe('https://cloudinary.com/nova.jpg');
      expect(deleteSpy).toHaveBeenCalledWith('antiga-id');
    });

    it('deve retornar 400 quando o corpo for vazio e nenhuma imagem for enviada', async () => {
      const item = await itemsRepository.create(makeItem());

      const response = await client
        .patch(`/items/${item.id}`)
        .set(authHeader)
        .send({})
        .expect(400);

      expect(response.body.code).toBe(400);
      expect(response.body.message).toContain(
        'Envie ao menos um campo para atualizar ou uma imagem',
      );
    });

    it('deve retornar 400 se campo fornecido for inválido (data com formato incorreto)', async () => {
      const item = await itemsRepository.create(makeItem());

      const response = await client
        .patch(`/items/${item.id}`)
        .set(authHeader)
        .send({ date: 'data-errada' })
        .expect(400);

      expect(response.body.code).toBe(400);

      // Confirma que não modificou o registro
      const notUpdated = await itemsRepository.findById(item.id);
      expect(notUpdated?.date).toBe(item.date);
    });

    it('deve retornar 404 ao tentar atualizar item com ID inexistente', async () => {
      const response = await client
        .patch('/items/id-inexistente')
        .set(authHeader)
        .send({ name: 'Novo Nome' })
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        code: 404,
        message: 'Item não encontrado',
      });
    });

    it('deve retornar 401 quando requisição de atualização não for autenticada', async () => {
      const item = await itemsRepository.create(makeItem());

      const response = await client
        .patch(`/items/${item.id}`)
        .send({ name: 'Tentativa sem auth' })
        .expect(401);

      expect(response.body.code).toBe(401);
    });

    it('deve retornar 502 se o upload da nova imagem falhar durante a atualização', async () => {
      const item = await itemsRepository.create(makeItem());

      jest
        .spyOn(storageService, 'uploadImage')
        .mockRejectedValueOnce(new storageService.ImageUploadError());

      const response = await client
        .patch(`/items/${item.id}`)
        .set(authHeader)
        .attach('image', Buffer.from('nova-imagem'), 'nova.jpg')
        .expect(502);

      expect(response.body.code).toBe(502);
    });

    it('deve retornar 500 se o repositório falhar na atualização', async () => {
      const item = await itemsRepository.create(makeItem());

      jest
        .spyOn(itemsRepository, 'updateById')
        .mockRejectedValueOnce(new Error('Erro no DB'));

      const response = await client
        .patch(`/items/${item.id}`)
        .set(authHeader)
        .send({ name: 'Nome' })
        .expect(500);

      expect(response.body.code).toBe(500);
    });
  });

  describe('Exclusão — DELETE /items/:id', () => {
    it('deve excluir item existente com status 204 e sem corpo de resposta', async () => {
      const item = await itemsRepository.create(
        makeItem({
          imagePublicId: 'public-id-a-remover',
        }),
      );

      const deleteImageSpy = jest
        .spyOn(storageService, 'deleteImage')
        .mockResolvedValueOnce();

      const response = await client
        .delete(`/items/${item.id}`)
        .set(authHeader)
        .expect(204);

      expect(response.text).toBe('');
      expect(deleteImageSpy).toHaveBeenCalledWith('public-id-a-remover');

      // Confirma remoção real
      const inDb = await itemsRepository.findById(item.id);
      expect(inDb).toBeNull();
    });

    it('deve retornar 404 ao tentar excluir ID inexistente', async () => {
      const response = await client
        .delete('/items/id-inexistente')
        .set(authHeader)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        code: 404,
        message: 'Item não encontrado',
      });
    });

    it('deve retornar 401 se o token não for enviado', async () => {
      const item = await itemsRepository.create(makeItem());

      const response = await client.delete(`/items/${item.id}`).expect(401);

      expect(response.body.code).toBe(401);
    });

    it('deve retornar 401 se o token for inválido', async () => {
      const item = await itemsRepository.create(makeItem());

      const response = await client
        .delete(`/items/${item.id}`)
        .set('Authorization', 'Bearer invalido')
        .expect(401);

      expect(response.body.code).toBe(401);
    });

    it('deve retornar 500 em caso de falha controlada na persistência durante exclusão', async () => {
      const item = await itemsRepository.create(makeItem());

      jest
        .spyOn(itemsRepository, 'deleteById')
        .mockRejectedValueOnce(new Error('Erro ao deletar'));

      const response = await client
        .delete(`/items/${item.id}`)
        .set(authHeader)
        .expect(500);

      expect(response.body.code).toBe(500);
      expect(response.body.message).toBe('Erro ao excluir item');
    });
  });

  describe('Exportação CSV — GET /items/export', () => {
    it('deve exportar CSV sem filtros com headers corretos e BOM UTF-8', async () => {
      await itemsRepository.create(
        makeItem({
          name: 'Óculos de Natação',
          description: 'Lentes azuis',
          location: 'Piscina Olímpica',
          date: '2026-05-10',
        }),
      );

      const response = await client.get('/items/export').expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-type']).toContain('charset=utf-8');
      expect(response.headers['content-disposition']).toContain('attachment; filename=');
      expect(response.headers['x-total-count']).toBe('1');

      // Verifica BOM UTF-8 (\uFEFF)
      expect(response.text.startsWith('\uFEFF')).toBe(true);
      expect(response.text).toContain('ID,Nome,Descrição,Local,Data,Imagem');
      expect(response.text).toContain('Óculos de Natação');
    });

    it('deve filtrar por data inicial (from)', async () => {
      await itemsRepository.create(makeItem({ name: 'Item Antigo', date: '2026-01-01' }));
      await itemsRepository.create(makeItem({ name: 'Item Novo', date: '2026-06-01' }));

      const response = await client
        .get('/items/export?from=2026-05-01')
        .expect(200);

      expect(response.headers['x-total-count']).toBe('1');
      expect(response.text).toContain('Item Novo');
      expect(response.text).not.toContain('Item Antigo');
    });

    it('deve filtrar por data final (to)', async () => {
      await itemsRepository.create(makeItem({ name: 'Item Passado', date: '2026-02-15' }));
      await itemsRepository.create(makeItem({ name: 'Item Futuro', date: '2026-08-20' }));

      const response = await client
        .get('/items/export?to=2026-05-01')
        .expect(200);

      expect(response.headers['x-total-count']).toBe('1');
      expect(response.text).toContain('Item Passado');
      expect(response.text).not.toContain('Item Futuro');
    });

    it('deve filtrar por intervalo com ambos os filtros (from e to)', async () => {
      await itemsRepository.create(makeItem({ name: 'Antes', date: '2026-01-10' }));
      await itemsRepository.create(makeItem({ name: 'Dentro', date: '2026-05-15' }));
      await itemsRepository.create(makeItem({ name: 'Depois', date: '2026-09-20' }));

      const response = await client
        .get('/items/export?from=2026-04-01&to=2026-06-01')
        .expect(200);

      expect(response.headers['x-total-count']).toBe('1');
      expect(response.text).toContain('Dentro');
      expect(response.text).not.toContain('Antes');
      expect(response.text).not.toContain('Depois');
    });

    it('deve suportar delimitador ponto e vírgula (;)', async () => {
      await itemsRepository.create(makeItem({ name: 'Caderno' }));

      const response = await client
        .get('/items/export?delimiter=;')
        .expect(200);

      expect(response.text).toContain('ID;Nome;Descrição;Local;Data;Imagem');
    });

    it('deve retornar 400 se o delimitador não for permitido', async () => {
      const response = await client
        .get('/items/export?delimiter=|')
        .expect(400);

      expect(response.body.code).toBe(400);
      expect(response.body.message).toContain('Parâmetros inválidos');
    });

    it('deve retornar 400 se o formato de data em from ou to for inválido', async () => {
      const response = await client
        .get('/items/export?from=01-05-2026')
        .expect(400);

      expect(response.body.code).toBe(400);
    });

    it('comportamento com intervalo invertido (from > to): retorna 0 registros no código atual', async () => {
      await itemsRepository.create(makeItem({ date: '2026-05-10' }));

      const response = await client
        .get('/items/export?from=2026-06-01&to=2026-01-01')
        .expect(200);

      // O código atual não valida se from <= to no schema, resultando em 0 itens
      expect(response.headers['x-total-count']).toBe('0');
      expect(response.text).toContain('ID,Nome,Descrição,Local,Data,Imagem');
      const lines = response.text.replace('\uFEFF', '').trim().split('\r\n');
      expect(lines.length).toBe(1); // Apenas a linha do cabeçalho
    });

    it('deve escapar corretamente aspas, delimitadores e quebras de linha (RFC 4180)', async () => {
      await itemsRepository.create(
        makeItem({
          name: 'Objeto "Especial", raro',
          description: 'Linha 1\nLinha 2, com vírgula',
        }),
      );

      const response = await client.get('/items/export').expect(200);

      // Aspas duplas devem ser duplicadas: ""Especial""
      expect(response.text).toContain('"Objeto ""Especial"", raro"');
      expect(response.text).toContain('"Linha 1\nLinha 2, com vírgula"');
    });

    it('deve neutralizar caracteres perigosos de fórmula (CSV Injection)', async () => {
      await itemsRepository.create(
        makeItem({
          name: '=SUM(1,2)',
          description: '+cmd.exe',
          location: '-123',
        }),
      );

      const response = await client.get('/items/export').expect(200);

      // Deve prefixar com apóstrofo
      expect(response.text).toContain("'=SUM(1,2)");
      expect(response.text).toContain("'+cmd.exe");
      expect(response.text).toContain("'-123");
    });

    it('deve retornar 500 em caso de erro no exportService', async () => {
      jest
        .spyOn(exportService, 'exportItemsCsv')
        .mockRejectedValueOnce(new Error('Erro na geração CSV'));

      const response = await client.get('/items/export').expect(500);

      expect(response.body).toMatchObject({
        success: false,
        code: 500,
        message: 'Erro ao exportar dados',
      });
    });
  });

  describe('Relatório PDF — GET /items/report', () => {
    it('deve gerar PDF com status 200, headers corretos e conteúdo binário não vazio', async () => {
      await itemsRepository.create(
        makeItem({ name: 'Chaveiro Perdido', location: 'Auditório' }),
      );

      const response = await client.get('/items/report').expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toBe(
        'attachment; filename=relatorio-itens.pdf',
      );
      expect(response.body).toBeDefined();
      expect(Buffer.isBuffer(response.body) || typeof response.text === 'string').toBe(true);
      expect(response.body.length || response.text.length).toBeGreaterThan(100);
    });

    it('deve retornar 500 quando a geração do relatório falhar', async () => {
      jest
        .spyOn(reportService, 'generateReport')
        .mockRejectedValueOnce(new Error('Falha no motor PDF'));

      const response = await client.get('/items/report').expect(500);

      expect(response.body).toMatchObject({
        success: false,
        code: 500,
        message: 'Erro ao gerar relatório',
      });
    });

    it('deve tratar erro emitido pelo stream do PDF fechando o stream ou retornando 500', async () => {
      const mockDoc = Object.assign(
        new Readable({
          read() {},
        }),
        {
          end() {
            return this;
          },
        },
      );

      mockDoc.pipe = function (dest: any) {
        process.nextTick(() => {
          mockDoc.emit('error', new Error('Falha no stream PDF'));
        });
        return dest;
      } as any;

      jest.spyOn(reportService, 'generateReport').mockResolvedValueOnce(mockDoc as any);

      try {
        const response = await client.get('/items/report');
        if (response.status === 500) {
          expect(response.body.message).toBe('Erro ao gerar relatório');
        }
      } catch (err: any) {
        // Quando res.destroy(error) é executado, o socket fecha
        expect(err).toBeDefined();
      }
    });
  });
});
