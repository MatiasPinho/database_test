import { Router } from "express";
export const router = Router();

import { ProductCt } from "../controllers/productsCt.js";

router.get("/", ProductCt.getAll);
router.get("/:id", ProductCt.getById);
router.delete("/:id", ProductCt.deleteOne);
router.post("/", ProductCt.addOne);
router.patch("/:id", ProductCt.updatedOne);
