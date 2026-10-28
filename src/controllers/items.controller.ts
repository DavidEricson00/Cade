import { Request, Response } from "express";
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  removeItem as removeItemService,
  ItemNotFoundError,
  ImageUploadError,
} from "../services/items.service";
import { StorageNotConfiguredError } from "../services/storage.service";
import {
  itemSchema,
  updateItemSchema,
} from '../schemas/item.schema';

type ItemParams = { id: string };

function fail(res: Response, status: number, message: string, data?: unknown) {
  return res.status(status).json({
    success: false,
    code: status,
    message,
    ...(data !== undefined && { data }),
  });
}

function handleError(res: Response, error: unknown, fallbackMessage: string) {
  if (error instanceof ItemNotFoundError) {
    return fail(res, 404, error.message);
  }
  if (error instanceof StorageNotConfiguredError) {
    return fail(res, 503, error.message);
  }
  if (error instanceof ImageUploadError) {
    console.error("ERRO NO UPLOAD DA IMAGEM:", error.cause ?? error);
    return fail(res, 502, error.message);
  }

  console.error(fallbackMessage, error);
  return fail(res, 500, fallbackMessage);
}

export async function listItems(_req: Request, res: Response) {
  try {
    const items = await getAllItems();

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Itens encontrados com sucesso",
      data: items,
    });
  } catch (error) {
    return handleError(res, error, "Erro ao buscar itens");
  }
}

export async function findItem(req: Request<ItemParams>, res: Response) {
  try {
    const item = await getItemById(req.params.id);

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Item encontrado com sucesso",
      data: item,
    });
  } catch (error) {
    return handleError(res, error, "Erro ao buscar item");
  }
}

export async function addItem(req: Request, res: Response) {
  const result = itemSchema.safeParse(req.body ?? {});

  if (!result.success) {
    return fail(res, 400, "Dados inválidos", result.error.issues);
  }

  try {
    const item = await createItem(result.data, req.file?.buffer);

    return res.status(201).json({
      success: true,
      code: 201,
      message: "Item criado com sucesso",
      data: item,
    });
  } catch (error) {
    return handleError(res, error, "Erro ao criar item");
  }
}

export async function editItem(req: Request<ItemParams>, res: Response) {
  const result = updateItemSchema.safeParse(req.body ?? {});

  if (!result.success) {
    return fail(res, 400, "Dados inválidos", result.error.issues);
  }

  const hasFields = Object.keys(result.data).length > 0;

  if (!hasFields && !req.file) {
    return fail(
      res,
      400,
      'Envie ao menos um campo para atualizar ou uma imagem no campo "image"',
    );
  }

  try {
    const updated = await updateItem(
      req.params.id,
      result.data,
      req.file?.buffer,
    );

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Item atualizado com sucesso",
      data: updated,
    });
  } catch (error) {
    return handleError(res, error, "Erro ao atualizar item");
  }
}

export async function removeItem(req: Request<ItemParams>, res: Response) {
  try {
    await removeItemService(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return handleError(res, error, "Erro ao excluir item");
  }
}