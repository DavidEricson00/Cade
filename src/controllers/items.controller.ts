
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
  const result = itemSchema.safeParse(req.body ?? {});

  if (!result.success) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: "Dados inválidos",
      data: result.error.issues,
    });
  }

  try {
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
      ...(image && {
        imageUrl: image.url,
        imagePublicId: image.publicId,
      }),
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

export async function updateItemImage(
  req: Request<ItemParams>,
  res: Response,
) {
  const { id } = req.params;

  try {
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

    const updated = await updateItem(id, {
      imageUrl: image.url,
      imagePublicId: image.publicId,
    });

    if (!updated) {
      await deleteImage(image.publicId);

      return res.status(404).json({
        success: false,
        code: 404,
        message: "Item não encontrado",
      });
    }

    if (item.imagePublicId) {
      await deleteImage(item.imagePublicId);
    }

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Imagem atualizada com sucesso",
      data: updated,
    });
  } catch (error) {
    console.error("Erro ao atualizar imagem:", error);

    return res.status(500).json({
      success: false,
      code: 500,
      message: "Erro ao atualizar imagem do item",
    });
  }
}

export async function removeItem(req: Request<ItemParams>, res: Response) {
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

    const deleted = await deleteItem(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: "Item não encontrado",
      });
    }

    if (item.imagePublicId) {
      try {
        await deleteImage(item.imagePublicId);
      } catch (error) {
        console.error("Erro ao excluir imagem do item:", error);
      }
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
