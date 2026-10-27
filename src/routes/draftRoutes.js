// =====================================================================
// ROUTES LAYER (controller) — receives HTTP requests, sends HTTP responses
// =====================================================================
// Spring Boot equivalent: a class annotated with @RestController, where each
// method has @GetMapping, @PostMapping, @PutMapping or @DeleteMapping.
//
// Rule of this layer: it only deals with HTTP.
//   1. read what the client sent (req.params, req.body)
//   2. call the service
//   3. send back the right status code and JSON (res)
// No business rules and no SQL here.

const express = require('express');
const draftService = require('../services/draftService');

// A Router is a mini-application that groups related routes.
// server.js mounts it under "/drafts", so "/" here means "/drafts".
const router = express.Router();

// Express 5 note: if an async handler throws (for example a 404 ApiError from
// the service), Express catches it and passes it to the error handler in
// server.js. That is why there is no try/catch in these handlers.

// GET /drafts  ->  200 OK + list of drafts
router.get('/', async (req, res) => {
  const drafts = await draftService.listDrafts();
  res.status(200).json(drafts);
});

// GET /drafts/:id  ->  200 OK + one draft (or 404)
// ":id" is a URL parameter: for GET /drafts/7, req.params.id is "7".
router.get('/:id', async (req, res) => {
  const draft = await draftService.getDraft(req.params.id);
  res.status(200).json(draft);
});

// POST /drafts  ->  201 Created + the new draft
// req.body is the JSON the client sent, already parsed by express.json().
router.post('/', async (req, res) => {
  const created = await draftService.createDraft(req.body);
  res
    .status(201)                                // 201 = a new resource was created
    .location(`/drafts/${created.id}`)          // REST convention: where to find it
    .json(created);
});

// PUT /drafts/:id  ->  200 OK + the replaced draft (or 404)
router.put('/:id', async (req, res) => {
  const updated = await draftService.replaceDraft(req.params.id, req.body);
  res.status(200).json(updated);
});

// DELETE /drafts/:id  ->  204 No Content (or 404)
router.delete('/:id', async (req, res) => {
  await draftService.deleteDraft(req.params.id);
  res.status(204).end(); // 204 = success, nothing to send back
});

module.exports = router;
