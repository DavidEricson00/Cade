import { ItemModel } from "../models/item.model";
import { Item } from "../types/item";

export async function getAllItems() {
  const items = await ItemModel.find()
    .select("-__v -createdAt -updatedAt")
    .lean();

  return items.map((item) => ({
    ...item,
    id: item.id ?? item._id.toString(),
  }));
}

export async function getItemById(id: string) {
  return ItemModel.findOne({ id })
    .select("-id -_v -createdAt -updatedAt")
    .lean();
}

export function updateItem(id: string, data: Partial<Omit<Item, 'id'>>) {
    const item = items.find((item) => item.id === id);

    if (!item) {
        return undefined;
    }

    Object.assign(item, data);
    return item;
}

export function deleteItem(id: string) {
    const index = items.findIndex((item) => item.id === id);

export async function deleteItem(id: string) {
  const result = await ItemModel.deleteOne({ id });

  return result.deletedCount > 0;
}