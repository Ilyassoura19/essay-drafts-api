// =====================================================================
// server.js — starts the Application Server (Node.js + Express)
// =====================================================================
// Spring Boot equivalent: the class with @SpringBootApplication and main().
// Here we assemble the app by hand: middleware, routes, error handling.

// 1. Load the secrets from .env into process.env (must be the FIRST line,
//    because db.js reads DATABASE_URL as soon as it is loaded).
require('dotenv').config({ quiet: true });

const express = require('express');
const draftRoutes = require('./routes/draftRoutes');
const { ApiError } = require('./errors');

const app = express();

// SECURITY: do not advertise "X-Powered-By: Express" in every response.
// Telling attackers the exact framework only helps them look up known flaws.
app.disable('x-powered-by');

// 2. Middleware = functions that run on EVERY request, before the routes.
// express.json() reads the JSON body and puts it in req.body.
// The size limit protects the server from huge bodies (denial of service).
app.use(express.json({ limit: '100kb' }));

// 3. Routes
// A tiny "is the server up?" route (useful for hosting health checks).
app.get('/', (req, res) => {
  res.json({ name: 'Essay Drafts API', status: 'running' });
});

// Every URL starting with /drafts goes to the routes layer.
app.use('/drafts', draftRoutes);

// 4. No route matched -> 404 Not Found, in JSON (not Express's HTML page).
app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
});

// 5. Error handler: Express recognises it because it has FOUR parameters.
// Every error thrown in the layers ends up here, in one place.
app.use((err, req, res, next) => {
  // Errors we created on purpose in the service (400, 404...)
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }
  // The client sent broken JSON, or a body above the 100kb limit
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'The request body is not valid JSON.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'The request body is too large.' });
  }

  // Anything else is a bug or a database problem.
  // SECURITY: log the details on the server, but send the client only a
  // generic message. Database error text can reveal table names and
  // structure to an attacker (information exposure, CWE-209).
  console.error('Unexpected error:', err.message);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

// 6. Start listening for requests.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Essay Drafts API running on http://localhost:${PORT}`);
});
