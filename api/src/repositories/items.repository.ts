import { ItemModel } from "../models/item.model";
import { Item } from "../types/item";
import { toDay } from "../utils/format-date";

const PROJECTION = "-__v -createdAt -updatedAt";

type ItemDoc = {
  id?: string | null;
  _id: { toString(): string };
  name: string;
  description: string;
  location: string;
  date: Date;
  imageUrl?: string | null;
  imagePublicId?: string | null;
};

function toItem(doc: ItemDoc): Item {
  return {
    id: doc.id ?? doc._id.toString(),
    name: doc.name,
    description: doc.description,
    location: doc.location,
    date: toDay(doc.date),
    imageUrl: doc.imageUrl ?? undefined,
    imagePublicId: doc.imagePublicId ?? undefined,
  };
}

export async function findAll(): Promise<Item[]> {
  const docs = await ItemModel.find().select(PROJECTION).lean();
  return docs.map(toItem);
}

export async function findById(id: string): Promise<Item | null> {
  const doc = await ItemModel.findOne({ id }).select(PROJECTION).lean();
  return doc ? toItem(doc) : null;
}

export async function create(item: Item): Promise<Item> {
  const created = await ItemModel.create(item);
  return toItem(created.toObject());
}

export async function updateById(
  id: string,
  data: Partial<Omit<Item, "id">>,
): Promise<Item | null> {
  const doc = await ItemModel.findOneAndUpdate(
    { id },
    { $set: data },
    { returnDocument: 'after', runValidators: true },
  )
    .select(PROJECTION)
    .lean();

  return doc ? toItem(doc) : null;
}

export async function deleteById(id: string) {
  const result = await ItemModel.deleteOne({ id });
  return result.deletedCount > 0;
}