const { hasPermission } = require('../config/roles');

/**
 * Authorization middleware — checks if user's role has required permission(s)
 * Usage: authorize('user:create', 'user:delete')
 */
const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const userRole = req.user.role;
    const hasAllPermissions = requiredPermissions.every((perm) =>
      hasPermission(userRole, perm)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        message: 'Forbidden. You do not have permission to perform this action.',
      });
    }

    next();
  };
};

module.exports = authorize;
