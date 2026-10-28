import { Router } from "express";
import {
  listItems,
  findItem,
  addItem,
  removeItem,
  editItem,
} from "../controllers/items.controller";
import { getReport } from '../controllers/report.controller';
import { exportItems } from '../controllers/export.controller';
import { uploadImage } from '../middlewares/upload';
import { authenticate } from "../middlewares/auth";

const router = Router();

router.get("/", listItems);
router.get("/:id", findItem);

router.get("/report", getReport);
router.get("/export", exportItems);

router.post("/", authenticate, uploadImage, addItem);
router.patch("/:id", authenticate, uploadImage, editItem);
router.delete("/:id", authenticate, removeItem);

export default router;