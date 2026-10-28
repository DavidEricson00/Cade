import { Request, Response } from "express";
import {
  getAllItems,
  getItemById,
  createItem,
  deleteItem,
  updateItem,
} from "../services/items.service";
import {
  uploadImage,
  deleteImage,
  StorageNotConfiguredError,
  UploadedImage,
} from "../services/storage.service";
import { itemSchema } from "../schemas/item.schema";

type ItemParams = {
  id: string;
};

export async function listItems(req: Request, res: Response) {
  try {
    const items = await getAllItems();

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Itens encontrados com sucesso",
      data: items,
    });
  } catch (error) {
    console.error("Erro ao listar itens:", error);
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Erro ao buscar itens",
    });
  }
}

export async function findItem(req: Request<ItemParams>, res: Response) {
  try {
    const { id } = req.params;
    const item = await getItemById(id);

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
  } catch (error) {
    console.error("Erro ao buscar item:", error);
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Erro ao buscar item",
    });
  }
}

export async function addItem(req: Request, res: Response) {
  const result = itemSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: "Dados inválidos",
      data: result.error.issues,
    });
  }

  try {
    const item = await createItem({
      id: crypto.randomUUID(),
      ...result.data,
    });

    return res.status(201).json({
      success: true,
      code: 201,
      message: "Item criado com sucesso",
      data: item,
    });
  } catch (error) {
    console.error("Erro ao criar item:", error);
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Erro ao criar item",
    });
  }
}

export async function removeItem(req: Request<ItemParams>, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await deleteItem(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: "Item não encontrado",
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir item:", error);
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Erro ao excluir item",
    });
  }
}