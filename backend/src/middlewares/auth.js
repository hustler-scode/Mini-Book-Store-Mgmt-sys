const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'mini-bookstore-secret-key-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a JWT token for a user
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      isstaff: user.isstaff,
      RoleId: user.RoleId
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Optional / Permissive Auth Middleware (per requirement:
 * "use jwt authentication mechanism and for now lets all the endpoints not be authorized")
 *
 * If a valid token is provided in Authorization header, it sets req.user.
 * If no token is provided, it does not block the request and allows it to proceed.
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        include: [{ model: Role, as: 'role' }],
        attributes: { exclude: ['password'] }
      });
      if (user) {
        req.user = user;
      }
    } catch (err) {
      // Per user instruction: for now endpoints are not strictly blocked
      // We log in debug and continue
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

/**
 * Strict auth middleware (can be applied per route whenever required)
 */
const requireAuth = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Valid JWT authentication token is required.'
    });
  }
  next();
};

module.exports = {
  generateToken,
  authenticateToken,
  requireAuth,
  JWT_SECRET
};

