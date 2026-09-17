import { Router } from "express";
import {
  listItems,
  findItem,
  addItem,
  removeItem,
} from "../controllers/items.controller";

const router = Router();

router.get("/", listItems);
router.post("/", addItem);
router.get("/:id", findItem);
router.delete("/:id", removeItem);

export default router;