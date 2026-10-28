const pool = require('../db');

const COLUMNS = 'id, title, content, word_count, created_at, updated_at';

async function findAllDrafts() {
  const result = await pool.query(`SELECT ${COLUMNS} FROM drafts ORDER BY id DESC`);
  return result.rows;
}

async function findDraftById(id) {
  const result = await pool.query(`SELECT ${COLUMNS} FROM drafts WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function insertDraft({ title, content, wordCount }) {
  const result = await pool.query(
    `INSERT INTO drafts (title, content, word_count)
     VALUES ($1, $2, $3)
     RETURNING ${COLUMNS}`,
    [title, content, wordCount]
  );
  return result.rows[0];
}

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

async function deleteDraft(id) {
  const result = await pool.query('DELETE FROM drafts WHERE id = $1', [id]);
  return result.rowCount > 0;
}

module.exports = { findAllDrafts, findDraftById, insertDraft, updateDraft, deleteDraft };
