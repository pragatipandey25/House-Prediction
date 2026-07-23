/**
 * Request Sanitization Middleware
 * Prevents NoSQL Injection and XSS attacks
 */

// Strip MongoDB operators ($ and .) from request body, query, and params
const stripMongoOperators = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => stripMongoOperators(item));
  }
  if (obj !== null && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip keys starting with $ (MongoDB operators)
      if (key.startsWith('$')) continue;
      // Replace dots in keys to prevent nested operator injection
      const safeKey = key.replace(/\./g, '_');
      sanitized[safeKey] = stripMongoOperators(value);
    }
    return sanitized;
  }
  return obj;
};

/**
 * Reassign a read-only property on the Express request object.
 * Express 5 defines req.query, req.body, and req.params as getter-only
 * properties. Direct assignment (e.g., req.query = ...) throws:
 *   "Cannot set property query of #<IncomingMessage> which has only a getter"
 *
 * Using Object.defineProperty() works because the original property descriptor
 * has configurable: true, allowing redefinition as a writable data property.
 */
const safeReassign = (req, property, value) => {
  Object.defineProperty(req, property, {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  });
};

// Sanitize request body
export const sanitizeBody = (req, res, next) => {
  if (req.body) {
    safeReassign(req, 'body', stripMongoOperators(req.body));
  }
  next();
};

// Sanitize request query
export const sanitizeQuery = (req, res, next) => {
  if (req.query) {
    safeReassign(req, 'query', stripMongoOperators(req.query));
  }
  next();
};

// Sanitize request params
export const sanitizeParams = (req, res, next) => {
  if (req.params) {
    safeReassign(req, 'params', stripMongoOperators(req.params));
  }
  next();
};

// Combined sanitize all
export const sanitizeAll = (req, res, next) => {
  sanitizeBody(req, res, () => {
    sanitizeQuery(req, res, () => {
      sanitizeParams(req, res, next);
    });
  });
};


