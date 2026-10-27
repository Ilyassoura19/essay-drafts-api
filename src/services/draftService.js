// =====================================================================
// SERVICE LAYER — the business rules
// =====================================================================
// Spring Boot equivalent: a class annotated with @Service.
//
// Rule of this layer: it decides WHAT is allowed and computes derived data
// (like the word count). It knows nothing about HTTP (no req, no res) and
// nothing about SQL. It asks the repository to read and write.

const draftRepository = require('../repositories/draftRepository');
const { ApiError } = require('../errors');

// Limits (input validation): reject absurd input before it reaches the database.
const MAX_TITLE_LENGTH = 200;       // same limit as the VARCHAR(200) column
const MAX_CONTENT_LENGTH = 50000;   // roughly 8,000 words: plenty for an essay

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

// Business rule: the word count is calculated HERE, never sent by the client.
// A client could lie about it; the server is the source of truth.
function countWords(text) {
  const trimmed = text.trim();
  if (trimmed === '') return 0;
  return trimmed.split(/\s+/).length; // split on any spaces, tabs or new lines
}

// The id comes from the URL as text ("7"). Accept only a positive whole number
// that fits in a PostgreSQL INTEGER column (max 2,147,483,647).
const MAX_ID = 2147483647;
function parseId(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1 || id > MAX_ID) {
    throw new ApiError(400, 'The id must be a positive whole number.');
  }
  return id;
}

// Validate the JSON body sent by the client for POST and PUT.
// Never trust input: check types and lengths, keep only the fields we expect.
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

  // Build a clean object: any extra field the client sent (for example a fake
  // "word_count" or "id") is simply ignored.
  return { title: title.trim(), content, wordCount: countWords(content) };
}

// ---------------------------------------------------------------------
// The use cases (one function per endpoint)
// ---------------------------------------------------------------------

async function listDrafts() {
  return draftRepository.findAllDrafts();
}

async function getDraft(rawId) {
  const id = parseId(rawId);
  const draft = await draftRepository.findDraftById(id);
  if (!draft) throw new ApiError(404, `Draft ${id} was not found.`);
  return draft;
}

// This is the function shown in the sequence diagram:
// Route -> createDraft(data) -> validate + word count -> insertDraft(draft)
async function createDraft(data) {
  const draft = validateDraftInput(data);
  return draftRepository.insertDraft(draft);
}

// PUT = replace the whole draft, so title and content are both required.
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
