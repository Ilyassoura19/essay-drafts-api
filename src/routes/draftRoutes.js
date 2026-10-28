const express = require('express');
const draftService = require('../services/draftService');

const router = express.Router();

router.get('/', async (req, res) => {
  const drafts = await draftService.listDrafts();
  res.status(200).json(drafts);
});

router.get('/:id', async (req, res) => {
  const draft = await draftService.getDraft(req.params.id);
  res.status(200).json(draft);
});

router.post('/', async (req, res) => {
  const created = await draftService.createDraft(req.body);
  res
    .status(201)
    .location(`/drafts/${created.id}`)
    .json(created);
});

router.put('/:id', async (req, res) => {
  const updated = await draftService.replaceDraft(req.params.id, req.body);
  res.status(200).json(updated);
});

router.delete('/:id', async (req, res) => {
  await draftService.deleteDraft(req.params.id);
  res.status(204).end();
});

module.exports = router;
