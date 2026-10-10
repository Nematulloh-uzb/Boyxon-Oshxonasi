import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export function useAuth() {
  const { user, accessToken, setUser, setToken, logout } = useAuthStore();
  const query = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then((r) => r.data),
    enabled: Boolean(accessToken) && !user,
    retry: false,
  });
  if (query.data && !user) setUser(query.data);
  return { user, accessToken, setUser, setToken, logout, loading: query.isLoading };
}
