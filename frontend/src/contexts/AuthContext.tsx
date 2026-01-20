import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthState, Module, PermissionAction, defaultPermissions, UserRole } from '@/types/auth';
import { apiFetch, ensureCsrfCookie } from '@/lib/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User; fieldErrors?: Record<string, string> }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string; fieldErrors?: Record<string, string> }>;
  logout: () => void;
  hasPermission: (module: Module, action: PermissionAction) => boolean;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
  subscriptionActive: boolean;
  subscriptionLoading: boolean;
  refreshSubscription: (silent?: boolean) => Promise<void>;
}

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type ApiUser = {
  id: number | string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  role: UserRole | string;
  permissions?: Record<string, Record<string, boolean>> | null;
  is_active?: boolean;
  is_pending_approval?: boolean;
  created_at?: string;
  last_login_at?: string | null;
  last_store_id?: number | string | null;
  owner_id?: number | string | null;
  max_stores?: number | null;
};

type ApiSubscriptionResponse = {
  subscription: {
    id: number | string;
    user_id: number | string;
    start_date: string;
    expiry_date: string;
    status: string;
  } | null;
  is_active: boolean;
};

const mapApiUser = (user: ApiUser): User => {
  const role = (user.role || 'user') as UserRole;
  return {
    id: String(user.id),
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone ?? undefined,
    role,
    storeIds: [],
    permissions: user.permissions ?? defaultPermissions[role],
    isActive: user.is_active ?? true,
    isPendingApproval: user.is_pending_approval ?? false,
    createdAt: user.created_at ?? new Date().toISOString(),
    lastLogin: user.last_login_at ?? undefined,
    lastStoreId: user.last_store_id ? String(user.last_store_id) : undefined,
    ownerId: user.owner_id ? String(user.owner_id) : undefined,
    maxStores: user.max_stores ?? undefined,
  };
};

const mapFieldErrors = (errors?: Record<string, string[]>): Record<string, string> | undefined => {
  if (!errors) return undefined;
  const fieldMap: Record<string, string> = {
    first_name: 'firstName',
    last_name: 'lastName',
    email: 'email',
    phone: 'phone',
    password: 'password',
    password_confirmation: 'confirmPassword',
  };
  return Object.entries(errors).reduce<Record<string, string>>((acc, [field, messages]) => {
    const key = fieldMap[field] || field;
    if (messages?.[0]) {
      acc[key] = messages[0];
    }
    return acc;
  }, {});
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const refreshSubscription = useCallback(async (silent: boolean = false) => {
    if (!state.user || state.user.role !== 'admin') {
      setSubscriptionActive(false);
      setSubscriptionLoading(false);
      return;
    }

    if (!silent) {
      setSubscriptionLoading(true);
    }
    try {
      const response = await apiFetch<ApiSubscriptionResponse>('/api/subscription/me');
      setSubscriptionActive(response.is_active);
    } catch {
      setSubscriptionActive(false);
    } finally {
      if (!silent) {
        setSubscriptionLoading(false);
      }
    }
  }, [state.user]);

  const refreshUser = useCallback(async () => {
    try {
      const user = await apiFetch<ApiUser>('/api/me');
      const mappedUser = mapApiUser(user);
      setState(prev => ({
        ...prev,
        user: mappedUser,
        isAuthenticated: true,
      }));
    } catch {
      // Keep existing session if refresh fails.
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const user = await apiFetch<ApiUser>('/api/me');
        if (!isMounted) return;
        const mappedUser = mapApiUser(user);
        setState({
          user: mappedUser,
          isAuthenticated: true,
          isLoading: false,
        });
        if (mappedUser.role === 'admin') {
          setSubscriptionLoading(true);
          try {
            const response = await apiFetch<ApiSubscriptionResponse>('/api/subscription/me');
            setSubscriptionActive(response.is_active);
          } catch {
            setSubscriptionActive(false);
          } finally {
            setSubscriptionLoading(false);
          }
        } else {
          setSubscriptionActive(false);
          setSubscriptionLoading(false);
        }
      } catch {
        if (!isMounted) return;
        setState(prev => ({
          ...prev,
          isLoading: false,
        }));
        setSubscriptionActive(false);
        setSubscriptionLoading(false);
      }
    };

    loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!state.user || state.user.role !== 'admin') return;
    if (subscriptionActive) return;

    const intervalId = window.setInterval(() => {
      refreshSubscription(true);
    }, 2000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshSubscription(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [state.user, subscriptionActive, refreshSubscription]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User; fieldErrors?: Record<string, string> }> => {
    try {
      await ensureCsrfCookie();
      const user = await apiFetch<ApiUser>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const mappedUser = mapApiUser(user);
      setState({
        user: mappedUser,
        isAuthenticated: true,
        isLoading: false,
      });

      if (mappedUser.role === 'admin') {
        await refreshSubscription();
      } else {
        setSubscriptionActive(false);
        setSubscriptionLoading(false);
      }

      return { success: true, user: mappedUser };
    } catch (error) {
      console.error('Login error:', error);
      const message = error instanceof Error ? error.message : 'Une erreur est survenue. Veuillez réessayer.';
      const fieldErrors = mapFieldErrors((error as Error & { errors?: Record<string, string[]> }).errors);
      return { success: false, error: message, fieldErrors };
    }
  }, []);

  const signup = useCallback(async (data: SignupData): Promise<{ success: boolean; error?: string; fieldErrors?: Record<string, string> }> => {
    try {
      await ensureCsrfCookie();
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          password: data.password,
          password_confirmation: data.password,
        }),
      });

      return {
        success: true,
        error: 'Votre compte a été créé et est en attente d\'approbation. Vous recevrez une notification une fois approuvé.',
      };
    } catch (error) {
      console.error('Signup error:', error);
      const message = error instanceof Error ? error.message : 'Une erreur est survenue. Veuillez réessayer.';
      const fieldErrors = mapFieldErrors((error as Error & { errors?: Record<string, string[]> }).errors);
      return { success: false, error: message, fieldErrors };
    }
  }, []);

  const logout = useCallback(() => {
    apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    setSubscriptionActive(false);
    setSubscriptionLoading(false);
  }, []);

  const hasPermission = useCallback((module: Module, action: PermissionAction): boolean => {
    if (!state.user) return false;
    return state.user.permissions[module]?.[action] ?? false;
  }, [state.user]);

  const updateUser = useCallback((updatedUser: User) => {
    setState(prev => ({
      ...prev,
      user: updatedUser,
    }));
  }, []);

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      signup,
      logout,
      hasPermission,
      updateUser,
      refreshUser,
      subscriptionActive,
      subscriptionLoading,
      refreshSubscription,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
