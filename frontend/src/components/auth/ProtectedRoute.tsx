import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { Module, PermissionAction } from '@/types/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  module?: Module;
  action?: PermissionAction;
}

export function ProtectedRoute({ children, module, action = 'view' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasPermission, user, subscriptionActive, subscriptionLoading } = useAuth();
  const { storeCount } = useStore();
  const location = useLocation();
  const isOverStoreLimit = user?.role === 'admin'
    && typeof user.maxStores === 'number'
    && storeCount > user.maxStores;
  const storeLimitAllowed = new Set(['/magasins', '/parametres', '/abonnement']);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (user?.role === 'admin') {
    if (subscriptionLoading) {
      return (
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Chargement...</p>
          </div>
        </div>
      );
    }

    if (!subscriptionActive && location.pathname !== '/abonnement') {
      return <Navigate to="/abonnement" replace />;
    }
  }

  if (isOverStoreLimit && !storeLimitAllowed.has(location.pathname)) {
    return <Navigate to="/magasins" replace />;
  }

  // Check module permission if specified
  if (module && !hasPermission(module, action)) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">Accès refusé</h2>
          <p className="mt-2 text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
