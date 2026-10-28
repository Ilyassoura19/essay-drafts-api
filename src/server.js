require('dotenv').config({ quiet: true });

const express = require('express');
const draftRoutes = require('./routes/draftRoutes');
const { ApiError } = require('./errors');

const app = express();

app.disable('x-powered-by');

app.use(express.json({ limit: '100kb' }));

app.get('/', (req, res) => {
  res.json({ name: 'Essay Drafts API', status: 'running' });
});

app.use('/drafts', draftRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
});

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'The request body is not valid JSON.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'The request body is too large.' });
  }

  console.error('Unexpected error:', err.message);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Essay Drafts API running on http://localhost:${PORT}`);
});
