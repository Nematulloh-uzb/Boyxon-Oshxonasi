import { create } from 'zustand';

interface UiState {
  mobileDrawer: boolean;
  filterOpen: boolean;
  notifOpen: boolean;
  checkoutOpen: boolean;
  set: (patch: Partial<UiState>) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  mobileDrawer: false,
  filterOpen: false,
  notifOpen: false,
  checkoutOpen: false,
  set: (patch) => set(patch),
}));
