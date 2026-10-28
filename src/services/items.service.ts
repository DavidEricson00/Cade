import { randomUUID } from "node:crypto";
import * as itemsRepository from "../repositories/items.repository";
import {
  uploadImage,
  deleteImage,
  StorageNotConfiguredError,
  UploadedImage,
} from "./storage.service";
import { Item } from "../types/item";

export type CreateItemData = Omit<Item, "id" | "imageUrl" | "imagePublicId">;
export type UpdateItemData = Partial<CreateItemData>;

export class ItemNotFoundError extends Error {
  constructor() {
    super("Item não encontrado");
    this.name = "ItemNotFoundError";
  }
}

export class ImageUploadError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("Erro ao enviar a imagem para a nuvem", options);
    this.name = "ImageUploadError";
  }
}

async function uploadOrThrow(buffer: Buffer): Promise<UploadedImage> {
  try {
    return await uploadImage(buffer);
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) throw error;
    throw new ImageUploadError({ cause: error });
  }
}

async function safeDeleteImage(publicId: string) {
  try {
    await deleteImage(publicId);
  } catch (error) {
    console.error("Erro ao excluir imagem na nuvem:", publicId, error);
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
  const image = file ? await uploadOrThrow(file) : undefined;

  try {
    return await itemsRepository.create({
      id: randomUUID(),
      ...data,
      ...(image && { imageUrl: image.url, imagePublicId: image.publicId }),
    });
  } catch (error) {
    if (image) await safeDeleteImage(image.publicId);
    throw error;
  }
}

export async function updateItem(
  id: string,
  data: UpdateItemData,
  file?: Buffer,
) {
  const current = await getItemById(id);

  const image = file ? await uploadOrThrow(file) : undefined;

  let updated;
  try {
    updated = await itemsRepository.updateById(id, {
      ...data,
      ...(image && { imageUrl: image.url, imagePublicId: image.publicId }),
    });
  } catch (error) {
    if (image) await safeDeleteImage(image.publicId);
    throw error;
  }

  if (!updated) {
    if (image) await safeDeleteImage(image.publicId);
    throw new ItemNotFoundError();
  }

  if (image && current.imagePublicId) {
    await safeDeleteImage(current.imagePublicId);
  }

  return updated;
}

export async function removeItem(id: string) {
  const item = await getItemById(id);

  const deleted = await itemsRepository.deleteById(id);
  if (!deleted) throw new ItemNotFoundError();

  if (item.imagePublicId) await safeDeleteImage(item.imagePublicId);
}