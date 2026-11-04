import { randomUUID } from "node:crypto";
import * as itemsRepository from "../repositories/items.repository";
import { uploadImage, deleteImage } from "./storage.service";
import { Item } from "../types/item";

export type CreateItemData = Omit<Item, "id" | "imageUrl" | "imagePublicId">;
export type UpdateItemData = Partial<CreateItemData>;

export class ItemNotFoundError extends Error {
  constructor() {
    super("Item não encontrado");
    this.name = "ItemNotFoundError";
  }
}

export async function getAllItems() {
  return itemsRepository.findAll();
}

export async function getItemById(id: string) {
  const item = await itemsRepository.findById(id);
  if (!item) throw new ItemNotFoundError();
  return item;
}

export async function createItem(data: CreateItemData, file?: Buffer) {
  const image = file ? await uploadImage(file) : undefined;

  try {
    return await itemsRepository.create({
      id: randomUUID(),
      ...data,
      ...(image && { imageUrl: image.url, imagePublicId: image.publicId }),
    });
  } catch (error) {
    if (image) await deleteImage(image.publicId);
    throw error;
  }
}

export async function updateItem(
  id: string,
  data: UpdateItemData,
  file?: Buffer,
) {
  const current = await getItemById(id);

  const image = file ? await uploadImage(file) : undefined;

  let updated;
  try {
    updated = await itemsRepository.updateById(id, {
      ...data,
      ...(image && { imageUrl: image.url, imagePublicId: image.publicId }),
    });
  } catch (error) {
    if (image) await deleteImage(image.publicId);
    throw error;
  }

  if (!updated) {
    if (image) await deleteImage(image.publicId);
    throw new ItemNotFoundError();
  }

  if (image) await deleteImage(current.imagePublicId);

  return updated;
}

export async function removeItem(id: string) {
  const item = await getItemById(id);

  const deleted = await itemsRepository.deleteById(id);
  if (!deleted) throw new ItemNotFoundError();

  await deleteImage(item.imagePublicId);
}