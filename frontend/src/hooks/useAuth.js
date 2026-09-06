import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

export const AUTH_KEYS = {
  me: ['auth', 'me'],
};

/**
 * Hook to manage authentication state
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('authToken');

  // Query to verify and load admin on mount / refresh
  const meQuery = useQuery({
    queryKey: AUTH_KEYS.me,
    queryFn: async () => {
      if (!token) return null;
      try {
        const res = await authApi.initialLogin(token);
        return res?.admin || res;
      } catch (err) {
        localStorage.removeItem('authToken');
        throw err;
      }
    },
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 15, // 15 mins
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEYS.me, data?.admin);
      toast.success('Login successful');
    },
    onError: (err) => {
      toast.error(err.message || 'Login failed');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.setQueryData(AUTH_KEYS.me, null);
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Logout failed');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data) => authApi.registerSuperAdmin(data),
    onSuccess: () => {
      toast.success('Registration successful');
    },
    onError: (err) => {
      toast.error(err.message || 'Registration failed');
    },
  });

  return {
    admin: meQuery.data || null,
    isLoggedIn: Boolean(meQuery.data),
    isLoading: meQuery.isLoading,
    isInitialLoading: meQuery.isLoading && Boolean(token),
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
  };
}
