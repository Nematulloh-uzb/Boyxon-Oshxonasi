import { useEffect } from 'react';
import { AppRouter } from './routes/AppRouter';
import { useSocket } from './hooks/useSocket';
import { useAuthStore } from './store/auth.store';
import { usersApi } from './api/users.api';
import { useTranslation } from 'react-i18next';

export default function App() {
  useSocket();
  const { accessToken, setUser, user } = useAuthStore();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (accessToken && !user) {
      usersApi.me().then((r) => setUser(r.data)).catch(() => undefined);
    }
  }, [accessToken, user, setUser]);

  useEffect(() => {
    if (user?.preferences.language && user.preferences.language !== i18n.language) {
      void i18n.changeLanguage(user.preferences.language);
    }
  }, [user, i18n]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', user?.preferences.theme === 'dark');
  }, [user]);

  return <AppRouter />;
}
