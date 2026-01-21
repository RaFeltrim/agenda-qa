// Utility functions for user profile handling
export const getUserInitials = (fullName?: string, userRole?: 'editor' | 'viewer' | 'admin' | null): string => {
  // If we have the full name, extract initials
  if (fullName) {
    const names = fullName.trim().split(' ').filter(name => name.length > 0);
    if (names.length >= 2) {
      // First letter of first name + first letter of last name
      const firstInitial = names[0]?.charAt(0) || '';
      const lastInitial = names[names.length - 1]?.charAt(0) || '';
      return (firstInitial + lastInitial).toUpperCase();
    } else if (names.length === 1) {
      // Just first letter if only one name
      const firstInitial = names[0]?.charAt(0) || '';
      return firstInitial.toUpperCase();
    }
  }

  // Fallback to role-based initials
  if (userRole === 'editor') return 'ED';
  if (userRole === 'viewer') return 'VW';
  return '??';
};