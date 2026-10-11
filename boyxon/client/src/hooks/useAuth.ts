import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export function useAuth() {
  const { user, accessToken, setUser, setToken, logout, logoutServer } = useAuthStore();
  const query = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then((r) => r.data),
    enabled: Boolean(accessToken) && !user,
    retry: false,
  });
  useEffect(() => {
    if (query.data && !user) setUser(query.data);
  }, [query.data, user, setUser]);
  return { user, accessToken, setUser, setToken, logout, logoutServer, loading: query.isLoading };
}
