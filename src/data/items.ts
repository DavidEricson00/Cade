import { Item } from "../types/item";

export const items: Item[] = [
    {
        id: crypto.randomUUID(),
        name: "Mochila Preta",
        description: "Mochila preta contendo cadernos",
        location: "Praça Central",
        date: "2026-09-15",
    },
    {
        id: crypto.randomUUID(),
        name: "Celular Samsung",
        description: "Celular preto com capa azul",
        location: "Biblioteca",
        date: "2026-09-14",
    },
    {
        id: crypto.randomUUID(),
        name: "Chave",
        description: "Chave com chaveiro azul",
        location: "Sala 5",
        date: "2026-09-13",
    },
]