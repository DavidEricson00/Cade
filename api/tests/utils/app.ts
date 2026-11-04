import request from 'supertest';
import app from '../../src/app';

/**
 * Instância da aplicação Express configurada na API original.
 */
export const testApp = app;

/**
 * Cria um client do Supertest vinculado à aplicação Express real da API Cadê?.
 */
export function createTestClient() {
  return request(app);
}
