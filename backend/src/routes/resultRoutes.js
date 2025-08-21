import express from "express";
import * as resultController from "../controllers/resultController.js";

const router = express.Router();

// Routes pour les résultats
router.get("/", resultController.getAll);
router.get("/:id", resultController.getOne);
router.post("/", resultController.create);
router.delete("/:id", resultController.remove);
router.get("/search", resultController.search);
router.get("/count", resultController.count);

export default router;
