const draftRepository = require('../repositories/draftRepository');
const { ApiError } = require('../errors');

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 50000;

function countWords(text) {
  const trimmed = text.trim();
  if (trimmed === '') return 0;
  return trimmed.split(/\s+/).length;
}

const MAX_ID = 2147483647;
function parseId(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1 || id > MAX_ID) {
    throw new ApiError(400, 'The id must be a positive whole number.');
  }
  return id;
}

function validateDraftInput(body) {
  if (!body || typeof body !== 'object') {
    throw new ApiError(400, 'Send a JSON body with a "title" and a "content".');
  }

  const { title, content } = body;

  if (typeof title !== 'string' || title.trim() === '') {
    throw new ApiError(400, 'A draft must have a non-empty "title".');
  }
  if (title.trim().length > MAX_TITLE_LENGTH) {
    throw new ApiError(400, `The title must be at most ${MAX_TITLE_LENGTH} characters.`);
  }
  if (typeof content !== 'string') {
    throw new ApiError(400, 'The "content" must be text (it can be empty).');
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    throw new ApiError(400, `The content must be at most ${MAX_CONTENT_LENGTH} characters.`);
  }

  return { title: title.trim(), content, wordCount: countWords(content) };
}

async function listDrafts() {
  return draftRepository.findAllDrafts();
}

async function getDraft(rawId) {
  const id = parseId(rawId);
  const draft = await draftRepository.findDraftById(id);
  if (!draft) throw new ApiError(404, `Draft ${id} was not found.`);
  return draft;
}

async function createDraft(data) {
  const draft = validateDraftInput(data);
  return draftRepository.insertDraft(draft);
}

async function replaceDraft(rawId, data) {
  const id = parseId(rawId);
  const draft = validateDraftInput(data);
  const updated = await draftRepository.updateDraft(id, draft);
  if (!updated) throw new ApiError(404, `Draft ${id} was not found.`);
  return updated;
}

async function deleteDraft(rawId) {
  const id = parseId(rawId);
  const deleted = await draftRepository.deleteDraft(id);
  if (!deleted) throw new ApiError(404, `Draft ${id} was not found.`);
}

module.exports = { listDrafts, getDraft, createDraft, replaceDraft, deleteDraft, countWords };
