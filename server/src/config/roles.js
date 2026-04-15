const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
};

const ROLE_LIST = Object.values(ROLES);

// Permission definitions — easily extensible
const PERMISSIONS = {
  [ROLES.ADMIN]: [
    'user:create',
    'user:read',
    'user:update',
    'user:delete',
    'user:assign-role',
    'user:list',
  ],
  [ROLES.MANAGER]: [
    'user:read',
    'user:update',
    'user:list',
  ],
  [ROLES.USER]: [
    'profile:read',
    'profile:update',
  ],
};

/**
 * Check if a role has a specific permission
 */
const hasPermission = (role, permission) => {
  return PERMISSIONS[role]?.includes(permission) || false;
};

module.exports = { ROLES, ROLE_LIST, PERMISSIONS, hasPermission };
