import { apiRequest } from './client';
import type { Item, ItemFields } from './types';

export async function listItems(signal?: AbortSignal): Promise<Item[]> {
  const res = await apiRequest<Item[]>('/items', { signal });
  return res.data ?? [];
}

export async function getItem(id: string, signal?: AbortSignal): Promise<Item> {
  const res = await apiRequest<Item>(`/items/${encodeURIComponent(id)}`, { signal });
  return res.data as Item;
}

function toFormData(fields: Partial<ItemFields>, image?: File | null): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) form.append(key, value);
  }
  if (image) form.append('image', image);
  return form;
}

export async function createItem(fields: ItemFields, image?: File | null): Promise<Item> {
  const res = await apiRequest<Item>('/items', {
    method: 'POST',
    formData: toFormData(fields, image),
  });
  return res.data as Item;
}

/** PATCH parcial: envie só os campos alterados e/ou uma nova imagem. */
export async function updateItem(
  id: string,
  fields: Partial<ItemFields>,
  image?: File | null,
): Promise<Item> {
  const res = await apiRequest<Item>(`/items/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    formData: toFormData(fields, image),
  });
  return res.data as Item;
}

export async function deleteItem(id: string): Promise<void> {
  await apiRequest<void>(`/items/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

