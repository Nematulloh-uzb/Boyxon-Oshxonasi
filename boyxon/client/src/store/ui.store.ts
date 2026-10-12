import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface UiState {
  mobileDrawer: boolean;
  filterOpen: boolean;
  notifOpen: boolean;
  checkoutOpen: boolean;
  chatOpen: boolean;
  theme: Theme;
  set: (patch: Partial<UiState>) => void;
  setTheme: (t: Theme) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  mobileDrawer: false,
  filterOpen: false,
  notifOpen: false,
  checkoutOpen: false,
  chatOpen: false,
  theme: 'dark',
  set: (patch) => set(patch),
  setTheme: (theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('boyxon-theme', theme);
    } catch {
      /* ignore */
    }
    set({ theme });
  },
}));
