// =====================================================================
// db.js — the connection between our Application Server and the
//         Database Server (Supabase / PostgreSQL)
// =====================================================================
// Spring Boot equivalent: the "spring.datasource.*" settings in
// application.yml, which Spring uses to build a connection pool for you.
// In Express nothing is automatic, so we create the pool ourselves.

// "pg" is the official PostgreSQL client library for Node.js.
const { Pool } = require('pg');

// The connection string is read from the .env file (loaded in server.js).
// We NEVER write the password in the code: code goes to GitHub, .env does not.
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing. Copy .env.example to .env and fill it in.');
}

// A "pool" keeps a few database connections open and reuses them.
// Opening a new connection for every request would be slow.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Supabase (or any cloud database) requires an encrypted connection: TLS.
  // That is the "SQL / TLS" arrow in the physical architecture diagram.
  // A database on your own laptop usually has no TLS, so it can be turned off.
  // Known trade-off: rejectUnauthorized:false keeps the traffic ENCRYPTED but
  // does not VERIFY the server's certificate (a man-in-the-middle could pose
  // as the database). For production, download Supabase's CA certificate and
  // pass it as { ca: ..., rejectUnauthorized: true }.
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
});

// Export the pool so the repository layer (and only that layer) can use it.
module.exports = pool;
