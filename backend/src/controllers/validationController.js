import * as validationService from "../services/validationService.js";

export async function saveValidation(req, res) {
  try {
    const validation = await validationService.saveValidation(req.body);
    res.status(201).json(validation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getValidationsForResult(req, res) {
  try {
    const validations = await validationService.getValidationsForResult(req.params.resultId);
    res.json(validations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getValidationStats(req, res) {
  try {
    const stats = await validationService.getValidationStats(req.params.resultId);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
