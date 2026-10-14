import { useEffect } from 'react';
import { AppRouter } from './routes/AppRouter';
import { useSocket } from './hooks/useSocket';
import { useAuthStore } from './store/auth.store';
import { usersApi } from './api/users.api';
import { useTranslation } from 'react-i18next';

export default function App() {
  useSocket();
  const { accessToken, setUser, user, logout } = useAuthStore();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (accessToken && !user) {
      // Token yaroqsiz bo'lsa jim yutmaymiz — logout qilib tozalaymiz,
      // aks holda keyingi so'rovlarda keraksiz 401 loop ketadi.
      usersApi.me().then((r) => setUser(r.data)).catch(() => logout());
    }
  }, [accessToken, user, setUser, logout]);

  useEffect(() => {
    const lang = user?.preferences?.language;
    if (lang && lang !== i18n.language) {
      void i18n.changeLanguage(lang);
    }
  }, [user, i18n]);

  useEffect(() => {
    // Tema: user preference ustuvor, aks holda localStorage (guest), default DARK
    const theme = user?.preferences?.theme ?? localStorage.getItem('boyxon-theme') ?? 'dark';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [user]);

  return <AppRouter />;
}
