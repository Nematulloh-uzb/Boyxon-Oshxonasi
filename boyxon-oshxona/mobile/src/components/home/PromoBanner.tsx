import { Pressable, Text } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { ranglar } from '../../constants/colors';

// Promo banner — XATO 9: expo-clipboard bilan nusxalaydi
export function PromoBanner({ onNusxa, onXato }: { onNusxa: () => void; onXato: () => void }) {
  const bos = async () => {
    try {
      await Clipboard.setStringAsync('BOYXON20');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onNusxa();
    } catch {
      onXato();
    }
  };
  return (
    <Pressable onPress={() => void bos()} className="mt-3 rounded-2xl p-4" style={{ backgroundColor: '#FFDAD8' }}>
      <Text className="text-[16px] font-bold" style={{ color: ranglar.matn }}>
        BOYXON20 — 20% chegirma 🎉
      </Text>
      <Text className="text-[13px]" style={{ color: ranglar.matn2 }}>
        Bosib nusxalang, savatchada ishlating
      </Text>
    </Pressable>
  );
}
