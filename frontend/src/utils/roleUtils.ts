import { UserRole } from '@/contexts/AuthContext';

/**
 * Determines the appropriate dashboard route based on user roles
 * Priority: Admin -> Admin dashboard, HR -> HR dashboard, Finance -> Finance dashboard
 */
export const getRoleBasedDashboard = (roles: UserRole[]): string => {
  if (roles.includes('admin')) {
    return '/admin'; // Admin Dashboard
  } else if (roles.includes('hr')) {
    return '/dashboard'; // HR Dashboard
  } else if (roles.includes('finance')) {
    return '/finance-dashboard'; // Finance Dashboard
  }
  return '/dashboard'; // Default fallback to HR dashboard
};

/**
 * Gets a user-friendly role name for display
 */
export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'hr':
      return 'HR Manager';
    case 'finance':
      return 'Finance Manager';
    default:
      return String(role).charAt(0).toUpperCase() + String(role).slice(1);
  }
};

/**
 * Gets the primary role for a user (used for display and routing)
 */
export const getPrimaryRole = (roles: UserRole[]): UserRole | null => {
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('hr')) return 'hr';
  if (roles.includes('finance')) return 'finance';
  return roles.length > 0 ? roles[0] : null;
};

/**
 * Checks if user has access to a specific route based on their roles
 */
export const hasRouteAccess = (userRoles: UserRole[], requiredRoles: UserRole[]): boolean => {
  if (userRoles.includes('admin')) return true; // Admin has access to everything
  return requiredRoles.some(role => userRoles.includes(role));
};