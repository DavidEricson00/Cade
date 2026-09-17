import { Request, Response } from "express";
import {
  getAllItems,
  getItemById,
  createItem,
  deleteItem,
} from "../services/items.service";
import { itemSchema } from "../schemas/item.schema";

type ItemParams = {
  id: string;
};

export function listItems(req: Request, res: Response) {
  const items = getAllItems();

  return res.status(200).json({
    success: true,
    code: 200,
    message: "Itens encontrados com sucesso",
    data: items,
  });
}

export function findItem(req: Request<ItemParams>, res: Response) {
  const { id } = req.params;

  const item = getItemById(id);

  if (!item) {
    return res.status(404).json({
      success: false,
      code: 404,
      message: "Item não encontrado",
    });
  }

  return res.status(200).json({
    success: true,
    code: 200,
    message: "Item encontrado com sucesso",
    data: item,
  });
}

export function addItem(req: Request, res: Response) {
  const result = itemSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: "Dados inválidos",
      data: result.error.issues,
    });
  }

  const item = createItem({
    id: crypto.randomUUID(),
    ...result.data,
  });

  return res.status(201).json({
    success: true,
    code: 201,
    message: "Item criado com sucesso",
    data: item,
  });
}

export function removeItem(req: Request<ItemParams>, res: Response) {
  const { id } = req.params;

  const deleted = deleteItem(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      code: 404,
      message: "Item não encontrado",
    });
  }

  return res.status(204).send();
}