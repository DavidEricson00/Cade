import { ItemModel } from "../models/item.model";
import { Item } from "../types/item";

const PROJECTION = "-__v -createdAt -updatedAt";

export async function findAll() {
  const items = await ItemModel.find().select(PROJECTION).lean();

  return items.map((item) => ({
    ...item,
    id: item.id ?? item._id.toString(),
  }));
}

export async function findById(id: string) {
  return ItemModel.findOne({ id }).select(PROJECTION).lean();
}

export async function create(item: Item) {
  const created = await ItemModel.create(item);

  return {
    id: created.id,
    name: created.name,
    description: created.description,
    location: created.location,
    date: created.date,
    ...(created.imageUrl && {
      imageUrl: created.imageUrl,
      imagePublicId: created.imagePublicId,
    }),
  };
}

export async function updateById(id: string, data: Partial<Omit<Item, "id">>) {
  return ItemModel.findOneAndUpdate(
    { id },
    { $set: data },
    { new: true, runValidators: true },
  )
    .select(PROJECTION)
    .lean();
}

export async function deleteById(id: string) {
  const result = await ItemModel.deleteOne({ id });
  return result.deletedCount > 0;
}