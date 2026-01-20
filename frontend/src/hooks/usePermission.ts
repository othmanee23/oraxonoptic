import { useAuth } from '@/contexts/AuthContext';
import { Module, PermissionAction } from '@/types/auth';

export function usePermission() {
  const { hasPermission, user } = useAuth();

  const can = (module: Module, action: PermissionAction): boolean => {
    return hasPermission(module, action);
  };

  const canView = (module: Module): boolean => can(module, 'view');
  const canCreate = (module: Module): boolean => can(module, 'create');
  const canEdit = (module: Module): boolean => can(module, 'edit');
  const canDelete = (module: Module): boolean => can(module, 'delete');
  const canValidate = (module: Module): boolean => can(module, 'validate');
  const canExport = (module: Module): boolean => can(module, 'export');

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  return {
    can,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canValidate,
    canExport,
    isAdmin,
    isManager,
    user,
  };
}
