import { Item } from '../types/item';

export const items: Item[] = [
  {
    id: crypto.randomUUID(),
    name: 'Mochila preta',
    description: 'Mochila preta contendo cadernos',
    location: 'Praça Central',
    date: '2026-09-15',
  },
  {
    id: crypto.randomUUID(),
    name: 'Chave com chaveiro azul',
    description: 'Chave de casa com chaveiro azul de silicone',
    location: 'Biblioteca Municipal',
    date: '2026-09-14',
  },
  {
    id: crypto.randomUUID(),
    name: 'Óculos de grau',
    description: 'Óculos de armação preta com lentes de grau',
    location: 'Terminal Rodoviário',
    date: '2026-09-13',
  },
];
