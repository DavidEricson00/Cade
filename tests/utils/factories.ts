import { randomUUID } from 'node:crypto';
import type { User } from '../../src/types/user';
import type { Item } from '../../src/types/item';

let counter = 0;

/**
 * Cria dados válidos para cadastro e autenticação de usuário, permitindo sobrescrever campos.
 */
export function makeUserData(overrides: Partial<User> = {}): User {
  counter += 1;
  return {
    name: `Usuário de Teste ${counter}`,
    email: `teste_${Date.now()}_${counter}_${Math.random().toString(36).slice(2, 7)}@example.com`,
    password: 'password123',
    ...overrides,
  };
}

export type ItemInput = Omit<Item, 'id' | 'imageUrl' | 'imagePublicId'>;

/**
 * Cria dados válidos para criação de um item (payload HTTP), permitindo sobrescrever campos.
 */
export function makeItemData(overrides: Partial<ItemInput> = {}): ItemInput {
  counter += 1;
  return {
    name: `Item de Teste ${counter}`,
    description: `Descrição detalhada do item de teste ${counter}`,
    location: 'Biblioteca Central',
    date: '2026-05-15',
    ...overrides,
  };
}

/**
 * Cria um objeto completo do tipo Item, com ID gerado.
 */
export function makeItem(overrides: Partial<Item> = {}): Item {
  const base = makeItemData();
  return {
    id: randomUUID(),
    name: base.name,
    description: base.description,
    location: base.location,
    date: base.date,
    ...overrides,
  };
}
