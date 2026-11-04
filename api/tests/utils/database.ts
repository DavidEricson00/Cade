import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

/**
 * Inicializa a instância em memória do MongoDB para garantir isolamento
 * total e segurança, evitando qualquer operação no banco compartilhado/Atlas.
 */
export async function setupTestDatabase(): Promise<string> {
  if (!mongod) {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    await mongoose.connect(uri, {
      driverInfo: { name: 'nodejs', version: '24' },
    });
  }

  return process.env.MONGODB_URI!;
}

/**
 * Remove todos os dados inseridos nas coleções entre testes.
 * Possui trava de segurança para garantir que nunca execute em Atlas ou produção.
 */
export async function clearTestDatabase(): Promise<void> {
  const currentUri = process.env.MONGODB_URI ?? '';
  
  // Trava de segurança obrigatória
  if (!currentUri.includes('127.0.0.1') && !currentUri.includes('localhost')) {
    throw new Error(
      `Operação destrutiva bloqueada por segurança. A URI configurada (${currentUri}) não aponta para um banco local de testes.`,
    );
  }

  if (mongoose.connection.readyState !== 1) {
    return;
  }

  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}

/**
 * Encerra a conexão do Mongoose e para o servidor em memória.
 */
export async function teardownTestDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
}
