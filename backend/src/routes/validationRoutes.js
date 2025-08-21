import express from "express";
import * as validationController from "../controllers/validationController.js";

const router = express.Router();

// Routes pour les validations
router.post("/", validationController.saveValidation);
router.get("/result/:resultId", validationController.getValidationsForResult);
router.get("/stats/:resultId", validationController.getValidationStats);

export default router;
