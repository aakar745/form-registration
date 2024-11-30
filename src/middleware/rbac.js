const { APIError } = require('../utils/errorHandler');

const rolePermissions = {
  admin: {
    forms: ['create', 'read', 'update', 'delete', 'manage'],
    users: ['create', 'read', 'update', 'delete', 'manage'],
    teams: ['create', 'read', 'update', 'delete', 'manage'],
    templates: ['create', 'read', 'update', 'delete', 'manage'],
    settings: ['read', 'update']
  },
  manager: {
    forms: ['create', 'read', 'update', 'delete'],
    users: ['read'],
    teams: ['read', 'update'],
    templates: ['create', 'read', 'update'],
    settings: ['read']
  },
  user: {
    forms: ['create', 'read', 'update', 'delete'],
    templates: ['read']
  }
};

// Check if a role has permission for a specific action on a resource
const checkPermission = (role, resource, action) => {
  if (!rolePermissions[role]) {
    return false;
  }

  const resourcePermissions = rolePermissions[role][resource];
  if (!resourcePermissions) {
    return false;
  }

  return resourcePermissions.includes(action);
};

// Middleware to require permission for a specific action on a resource
const requirePermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;

      if (!checkPermission(userRole, resource, action)) {
        throw new APIError('Permission denied', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  checkPermission,
  requirePermission
};
