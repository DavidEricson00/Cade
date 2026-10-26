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

function sendUploadError(res: Response, error: unknown) {
  console.error("ERRO NO UPLOAD DA IMAGEM:", error);

  if (error instanceof StorageNotConfiguredError) {
    return res.status(503).json({
      success: false,
      code: 503,
      message: error.message,
    });
  }

  return res.status(502).json({
    success: false,
    code: 502,
    message: "Erro ao enviar a imagem para a nuvem",
  });
}

export async function listItems(req: Request, res: Response) {
  const items = await getAllItems();

  return res.status(200).json({
    success: true,
    code: 200,
    message: "Itens encontrados com sucesso",
    data: items,
  });
}

export async function findItem(req: Request<ItemParams>, res: Response) {
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
}

export async function addItem(req: Request, res: Response) {
  const result = itemSchema.safeParse(req.body ?? {});

  if (!result.success) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: "Dados inválidos",
      data: result.error.issues,
    });
  }

  // A imagem é opcional; só sobe para a nuvem depois de validar os dados.
  let image: UploadedImage | undefined;

  if (req.file) {
    try {
      image = await uploadImage(req.file.buffer);
    } catch (error) {
      return sendUploadError(res, error);
    }
  }

  const item = await createItem({
    id: crypto.randomUUID(),
    ...result.data,
    ...(image && { imageUrl: image.url, imagePublicId: image.publicId }),
  });

  return res.status(201).json({
    success: true,
    code: 201,
    message: "Item criado com sucesso",
    data: item,
  });
}

export async function updateItemImage(req: Request<ItemParams>, res: Response) {
  const { id } = req.params;

  const item = await getItemById(id);

  if (!item) {
    return res.status(404).json({
      success: false,
      code: 404,
      message: "Item não encontrado",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: 'Envie uma imagem no campo "image" (multipart/form-data)',
    });
  }

  let image: UploadedImage;

  try {
    image = await uploadImage(req.file.buffer);
  } catch (error) {
    return sendUploadError(res, error);
  }

  const previousPublicId = item.imagePublicId;

  const updated = await updateItem(id, {
    imageUrl: image.url,
    imagePublicId: image.publicId,
  });

  await deleteImage(previousPublicId);

  return res.status(200).json({
    success: true,
    code: 200,
    message: "Imagem atualizada com sucesso",
    data: updated,
  });
}

export async function removeItem(req: Request<ItemParams>, res: Response) {
  const { id } = req.params;

  const item = await getItemById(id);
  const deleted = item ? await deleteItem(id) : false;

  if (!deleted) {
    return res.status(404).json({
      success: false,
      code: 404,
      message: "Item não encontrado",
    });
  }

  await deleteImage(item?.imagePublicId);

  return res.status(204).send();
}