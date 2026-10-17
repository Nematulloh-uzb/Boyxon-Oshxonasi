import MaterialIcons from '@expo/vector-icons/MaterialIcons';

/**
 * Material Symbols nomlarini @expo/vector-icons (MaterialIcons) orqali chizadi.
 * Nom `snake_case` → `kebab-case` avtomatik o'giriladi; agar ikonka to'plamda
 * bo'lmasa — zaxira ikonka ishlatiladi (dizayndagi nomlar would render bo'sh
 * to'rtburchak bo'lib qolmasligi uchun).
 */
const FALLBACKS: Record<string, string> = {
  'soup-kitchen': 'ramen-dining',
  'kebab-dining': 'outdoor-grill',
  'bakery-dining': 'local-pizza',
  'roofing': 'home',
  'receipt-long': 'receipt',
  'directions-walk': 'directions-walk',
  'two-wheeler': 'moped',
  'delivery-dining': 'delivery-dining',
  'notifications-active': 'notifications',
  'inventory-2': 'inventory',
  'assignment-turned-in': 'assignment-turned-in',
  'person-add': 'person-add',
  'signpost': 'share-location',
  'qr-code-scanner': 'qr-code-scanner',
  'add-circle': 'add-circle-outline',
  'error-outline': 'error-outline',
  'radio-button-unchecked': 'radio-button-unchecked',
  'check-circle': 'check-circle',
  'toggle-on': 'toggle-on',
  'toggle-off': 'toggle-off',
};

const glyphs = MaterialIcons.glyphMap as Record<string, number>;

function resolveName(name: string): string {
  const kebab = name.replace(/_/g, '-');
  if (glyphs[kebab]) return kebab;
  const alt = FALLBACKS[kebab];
  if (alt && glyphs[alt]) return alt;
  return kebab;
}

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: import('react-native').StyleProp<import('react-native').TextStyle>;
}

export function Icon({ name, size = 22, color, style }: IconProps) {
  return <MaterialIcons name={resolveName(name) as never} size={size} color={color} style={style} />;
}
