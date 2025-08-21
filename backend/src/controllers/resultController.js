import * as resultService from "../services/resultService.js";

export async function getAll(req, res) {
  try {
    const results = await resultService.getAllResults();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getOne(req, res) {
  try {
    const result = await resultService.getResultById(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Résultat non trouvé" });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getMetadata(req, res) {
  try {
    const metadata = await resultService.getResultMetadata(req.params.id);
    res.json(metadata);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function create(req, res) {
  try {
    const result = await resultService.createResult(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function remove(req, res) {
  try {
    await resultService.deleteResult(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function search(req, res) {
  try {
    const query = req.query.q;
    const results = await resultService.searchResults(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function count(req, res) {
  try {
    const count = await resultService.getResultsCount();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
