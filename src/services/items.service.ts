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

export async function createItem(item: Item) {
  const created = await ItemModel.create(item);

  return {
    id: created.id,
    name: created.name,
    description: created.description,
    location: created.location,
    date: created.date,
  };
}

export async function deleteItem(id: string) {
  const result = await ItemModel.deleteOne({ id });

  return result.deletedCount > 0;
}