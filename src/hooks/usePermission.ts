import { useMemo } from 'react';
import { useAuth } from './useAuth';

export const usePermission = (permissionKey: string): boolean => {
  const { currentUser } = useAuth();
  return useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN' || currentUser.role === 'VENDOR') return true;
    const raw = localStorage.getItem('staffPermissions');
    const permissions: string[] = raw ? JSON.parse(raw) : [];
    return permissions.includes(permissionKey);
  }, [currentUser, permissionKey]);
};

