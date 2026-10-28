import { Router } from "express";
import {
  listItems,
  findItem,
  addItem,
  removeItem,
  updateItemImage,
} from "../controllers/items.controller";
import { getReport } from '../controllers/report.controller';
import { exportItems } from '../controllers/export.controller';
import { uploadImage } from '../middlewares/upload';

const router = Router();

router.get("/", listItems);
router.post("/", uploadImage, addItem);
router.get("/report", getReport);
router.get("/export", exportItems);
router.get("/:id", findItem);
router.put("/:id/image", uploadImage, updateItemImage);
router.delete("/:id", removeItem);

export default router;