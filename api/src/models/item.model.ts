import { Schema, model } from 'mongoose';

const itemSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    imageUrl: { type: String },
    imagePublicId: { type: String },
  },
  { timestamps: true },
);

export const ItemModel = model('Item', itemSchema);