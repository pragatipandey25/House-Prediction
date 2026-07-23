# Fix: "Cannot set property query of #<IncomingMessage> which has only a getter"

## Root Cause

Express 5 defines `req.query`, `req.body`, and `req.params` as read-only getter properties. Two pieces of code were attempting to reassign these using `=`:

1. **Our custom middleware** `backend/middleware/sanitizeMiddleware.js` — Fixed with `Object.defineProperty()`
2. **npm package** `express-mongo-sanitize` (used in `server.js`) — Removed; our custom middleware handles the same functionality correctly.

## Steps

- [x] 1. Analyze backend files and identify root cause
- [x] 2. Fix `sanitizeMiddleware.js` — Replace `=` assignments with `Object.defineProperty()`
- [x] 3. Remove `express-mongo-sanitize` from `server.js` (import + middleware usage)
- [x] 4. Update misleading console.log message
- [x] 5. Verify no remaining references
