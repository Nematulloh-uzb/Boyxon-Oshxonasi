/**
 * Boyxon Oshxonasi — dizayn tokenlari.
 *
 * Manba: Google Stitch loyihasi "Mobile Responsive Web Platform"
 * (Material-3 tokenlar + Epilogue/Inter shriftlari, 8pt grid).
 * Light qiymatlar `tailwind-config`dan AYNAN olingan; dark qiymatlar
 * dark ekranlardagi literal qiymatlar bilan moslangan.
 */

export type ThemeMode = 'light' | 'dark';

export interface Palette {
  background: string;
  surface: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  /** Chip/toggle OFF fonlari (surface-variant) */
  surfaceVariant: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  primaryFixed: string;
  primaryFixedDim: string;
  onPrimaryFixed: string;
  onPrimaryFixedVariant: string;
  /** Karta fonida ishlatiladigan "fixed" fon (promo, badge) */
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  secondaryFixed: string;
  onSecondaryFixed: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  tertiaryFixed: string;
  onTertiaryFixedVariant: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  inverseSurface: string;
  inverseOnSurface: string;
  /** Dish rasmi yo'q — placeholder blok foni */
  placeholderBg: string;
  /** Dish rasmi yo'q — ikonka/rang */
  placeholderInk: string;
  /** Karta soyasi rangi (warm ambient) */
  shadow: string;
}

const light: Palette = {
  background: '#fcf9f8',
  surface: '#fcf9f8',
  surfaceDim: '#dcd9d9',
  surfaceBright: '#fcf9f8',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f6f3f2',
  surfaceContainer: '#f0eded',
  surfaceContainerHigh: '#eae7e7',
  surfaceContainerHighest: '#e5e2e1',
  surfaceVariant: '#e5e2e1',
  onSurface: '#1c1b1b',
  onSurfaceVariant: '#564337',
  outline: '#897365',
  outlineVariant: '#dcc1b1',
  primary: '#944a00',
  onPrimary: '#ffffff',
  primaryContainer: '#e67e22',
  onPrimaryContainer: '#502600',
  primaryFixed: '#ffdcc5',
  primaryFixedDim: '#ffb783',
  onPrimaryFixed: '#301400',
  onPrimaryFixedVariant: '#713700',
  secondary: '#a23f00',
  onSecondary: '#ffffff',
  secondaryContainer: '#fc7127',
  onSecondaryContainer: '#5c2000',
  secondaryFixed: '#ffdbcd',
  onSecondaryFixed: '#351000',
  tertiary: '#006d37',
  onTertiary: '#ffffff',
  tertiaryContainer: '#29af61',
  onTertiaryContainer: '#003a1a',
  tertiaryFixed: '#7efba4',
  onTertiaryFixedVariant: '#005228',
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  inverseSurface: '#313030',
  inverseOnSurface: '#f3f0ef',
  placeholderBg: '#F5EFE7',
  placeholderInk: '#5D4037',
  shadow: '#5D4037',
};

const dark: Palette = {
  background: '#121212',
  surface: '#121212',
  surfaceDim: '#121212',
  surfaceBright: '#393939',
  surfaceContainerLowest: '#1e1e1e',
  surfaceContainerLow: '#181818',
  surfaceContainer: '#252525',
  surfaceContainerHigh: '#2c2c2c',
  surfaceContainerHighest: '#353534',
  surfaceVariant: '#353534',
  onSurface: '#ffffff',
  onSurfaceVariant: '#a0a0a0',
  outline: '#4a4a4a',
  outlineVariant: '#2e2e2e',
  primary: '#e67e22',
  onPrimary: '#ffffff',
  primaryContainer: '#e67e22',
  onPrimaryContainer: '#ffdcc5',
  primaryFixed: '#3d2511',
  primaryFixedDim: '#e67e22',
  onPrimaryFixed: '#ffb783',
  onPrimaryFixedVariant: '#ffb783',
  secondary: '#ffb961',
  onSecondary: '#121212',
  secondaryContainer: '#963800',
  onSecondaryContainer: '#ffddb9',
  secondaryFixed: '#3d2511',
  onSecondaryFixed: '#ffb783',
  tertiary: '#4ade80',
  onTertiary: '#121212',
  tertiaryContainer: '#1b4b2c',
  onTertiaryContainer: '#85e0a3',
  tertiaryFixed: '#0f2e1b',
  onTertiaryFixedVariant: '#85e0a3',
  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
  inverseSurface: '#e5e2e1',
  inverseOnSurface: '#313030',
  placeholderBg: '#2a2a2a',
  placeholderInk: '#a0a0a0',
  shadow: '#000000',
};

export const palettes: Record<ThemeMode, Palette> = { light, dark };

/** 8pt asosidagi spacing (tailwind-config bilan aynan) */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  /** Desktop outer margin (kam ishlatiladi) */
  margin: 32,
  /** Mobil outer margin / gutter */
  marginMobile: 16,
  gutter: 24,
  gutterMobile: 16,
} as const;

/** Border radius (tailwind-config bilan aynan) */
export const radius = {
  /** 4px */
  default: 4,
  /** 8px — kichik tugmalar */
  lg: 8,
  /** 12px — kartalar, inputlar, katta tugmalar */
  xl: 12,
  /** 16px */
  xl2: 16,
  /** 32px — auth sheet va katta panel burchaklari */
  sheet: 32,
  /** To'liq yumaloq */
  full: 9999,
} as const;

/**
 * Tipografiya (Epilogue — sarlavhalar, Inter — matn/label).
 * Shrift fayllari @expo-google-fonts orqali yuklanadi; fontFamily'da aniq
 * vazn ko'rsatiladi (bold orqali emas) — Android'da to'g'ri tanlanishi uchun.
 */
export const fontFamily = {
  epilogueSemiBold: 'Epilogue_600SemiBold',
  epilogueBold: 'Epilogue_700Bold',
  interRegular: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
} as const;

export const typography = {
  headlineXl: { fontFamily: fontFamily.epilogueBold, fontSize: 40, lineHeight: 48, letterSpacing: -0.8 },
  headlineXlMobile: { fontFamily: fontFamily.epilogueBold, fontSize: 30, lineHeight: 38, letterSpacing: -0.45 },
  headlineLg: { fontFamily: fontFamily.epilogueSemiBold, fontSize: 32, lineHeight: 40, letterSpacing: -0.48 },
  headlineLgMobile: { fontFamily: fontFamily.epilogueSemiBold, fontSize: 24, lineHeight: 32, letterSpacing: -0.24 },
  headlineMd: { fontFamily: fontFamily.epilogueSemiBold, fontSize: 22, lineHeight: 28 },
  headlineSm: { fontFamily: fontFamily.epilogueSemiBold, fontSize: 18, lineHeight: 24 },
  bodyLg: { fontFamily: fontFamily.interRegular, fontSize: 16, lineHeight: 24 },
  bodyMd: { fontFamily: fontFamily.interRegular, fontSize: 14, lineHeight: 20 },
  bodySm: { fontFamily: fontFamily.interRegular, fontSize: 12, lineHeight: 16 },
  labelLg: { fontFamily: fontFamily.interSemiBold, fontSize: 14, lineHeight: 20, letterSpacing: 0.14 },
  labelMd: { fontFamily: fontFamily.interSemiBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.24 },
  labelSm: { fontFamily: fontFamily.interMedium, fontSize: 11, lineHeight: 14, letterSpacing: 0.33 },
} as const;

export type TypographyToken = keyof typeof typography;

/**
 * Warm ambient soyalar (dizayn qo'llanmasi: sovuq kulrang soya emas).
 * RN'da iOS uchun shadow*, Android uchun elevation ishlatiladi.
 */
export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface Shadows {
  card: ShadowStyle;
  raised: ShadowStyle;
  modal: ShadowStyle;
}

export const shadows: { light: Shadows; dark: Shadows } = {
  light: {
    /** Level 1 — kartalar */
    card: {
      shadowColor: '#5D4037',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    /** Level 2 — hover/ta'sirchan elementlar */
    raised: {
      shadowColor: '#D35400',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 6,
    },
    /** Level 3 — modal/sheet */
    modal: {
      shadowColor: '#1A1A1A',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.16,
      shadowRadius: 32,
      elevation: 12,
    },
  },
  dark: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 2,
    },
    raised: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.6,
      shadowRadius: 28,
      elevation: 8,
    },
    modal: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 0.8,
      shadowRadius: 48,
      elevation: 16,
    },
  },
};
