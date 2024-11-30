// Define all available pages in the system
export const AVAILABLE_PAGES = [
  {
    id: 'dashboard',
    path: '/admin',
    label: 'Dashboard',
    icon: 'Dashboard',
    default: true, // Always visible to all users
  },
  {
    id: 'users',
    path: '/admin/users',
    label: 'User Management',
    icon: 'People',
    adminOnly: true, // Only visible to admins
  },
  {
    id: 'forms',
    path: '/admin/forms',
    label: 'Forms',
    icon: 'Description',
    assignable: true, // Can be assigned to users
  },
  {
    id: 'responses',
    path: '/admin/responses',
    label: 'Form Responses',
    icon: 'Assessment',
    assignable: true,
  },
  {
    id: 'settings',
    path: '/admin/settings',
    label: 'Settings',
    icon: 'Settings',
    assignable: true,
  },
];

// Get pages that can be assigned to users
export const getAssignablePages = () => {
  return AVAILABLE_PAGES.filter(page => page.assignable);
};

// Get visible pages for a user based on their role and assigned pages
export const getVisiblePages = (role, assignedPages = []) => {
  return AVAILABLE_PAGES.filter(page => {
    if (role === 'admin') return true; // Admin sees all pages
    if (page.default) return true; // Everyone sees default pages
    if (page.adminOnly) return false; // Non-admins don't see admin-only pages
    return assignedPages.includes(page.id); // Check if page is assigned to user
  });
};
