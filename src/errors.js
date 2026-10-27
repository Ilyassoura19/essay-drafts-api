// =====================================================================
// errors.js — one small error type shared by the layers
// =====================================================================
// When the service finds a problem (bad input, draft not found), it throws
// an ApiError that already knows which HTTP status code fits.
// The error handler in server.js turns it into a clean JSON response.

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status; // e.g. 400 Bad Request, 404 Not Found
  }
}

module.exports = { ApiError };
