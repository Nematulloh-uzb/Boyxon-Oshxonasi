import { BoshHolat } from '../ui/EmptyState';
import { router } from 'expo-router';

// Bo'sh savat — XATO 15: rasm + sarlavha + CTA
export function BoshSavatHolat() {
  return (
    <BoshHolat
      sarlavha="Savatcha bo‘sh"
      izoh="Hozircha hech narsa qo‘shmadingiz. Mazali taomlarni ko‘ring!"
      tugma="Taomlarni ko‘rish"
      onPress={() => router.push('/(tabs)' as never)}
    />
  );
}
