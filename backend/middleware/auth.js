const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  let token = req.header('x-auth-token');
  console.log('[Auth Middleware] Incoming token:', token);

  if (!token) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
      console.log('[Auth Middleware] Found Bearer token:', token);
    }
  }
  // Check if no token
  if (!token) {
    console.log('[Auth Middleware] No token found, denying request');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[Auth Middleware] Decoded JWT:', decoded);
    req.user = decoded.user;
    next();
  } catch (error) {
    console.log('[Auth Middleware] Token verification failed:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
