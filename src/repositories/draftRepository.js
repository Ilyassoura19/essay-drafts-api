// =====================================================================
// REPOSITORY LAYER — the only layer that talks to the database
// =====================================================================
// Spring Boot equivalent: a JPA repository (e.g. DraftRepository extends
// JpaRepository). JPA writes the SQL for you; here we write it ourselves,
// so you can see exactly what reaches PostgreSQL.
//
// Rule of this layer: NO business rules, NO HTTP. Just SQL in, rows out.

const pool = require('../db');

// SECURITY — parameterized queries
// Every value is sent separately as $1, $2... and NEVER glued into the SQL
// string. If a user sends a title like  '; DROP TABLE drafts; --
// PostgreSQL treats it as plain text, not as SQL. This blocks SQL injection
// (CWE-89), one of the most common web vulnerabilities.

// The columns we send back to the client (we never use SELECT * on purpose:
// it is clearer, and a column added later is not leaked by accident).
const COLUMNS = 'id, title, content, word_count, created_at, updated_at';

// GET /drafts  ->  all drafts, newest first
async function findAllDrafts() {
  const result = await pool.query(`SELECT ${COLUMNS} FROM drafts ORDER BY id DESC`);
  return result.rows;
}

// GET /drafts/:id  ->  one draft, or null if it does not exist
async function findDraftById(id) {
  const result = await pool.query(`SELECT ${COLUMNS} FROM drafts WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

// POST /drafts  ->  insert a new row and return it (RETURNING gives us the id
// and created_at that PostgreSQL generated)
async function insertDraft({ title, content, wordCount }) {
  const result = await pool.query(
    `INSERT INTO drafts (title, content, word_count)
     VALUES ($1, $2, $3)
     RETURNING ${COLUMNS}`,
    [title, content, wordCount]
  );
  return result.rows[0];
}

// PUT /drafts/:id  ->  replace a draft; returns null if the id does not exist
async function updateDraft(id, { title, content, wordCount }) {
  const result = await pool.query(
    `UPDATE drafts
     SET title = $1, content = $2, word_count = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING ${COLUMNS}`,
    [title, content, wordCount, id]
  );
  return result.rows[0] || null;
}

// DELETE /drafts/:id  ->  true if a row was deleted, false if it did not exist
async function deleteDraft(id) {
  const result = await pool.query('DELETE FROM drafts WHERE id = $1', [id]);
  return result.rowCount > 0;
}

module.exports = { findAllDrafts, findDraftById, insertDraft, updateDraft, deleteDraft };
