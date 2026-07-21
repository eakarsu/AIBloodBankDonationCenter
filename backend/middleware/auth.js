'use strict';
const jwt = require('jsonwebtoken');
module.exports = function authenticate(req, res, next) {
  const header = req.get('Authorization');
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Bearer token required' });
  if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'Authentication is not configured' });
  try { req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET); return next(); }
  catch { return res.status(401).json({ error: 'Invalid or expired token' }); }
};
