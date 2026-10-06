import { Pressable, Text, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ranglar } from '../../constants/colors';

interface TugmaProps {
  sarlavha: string;
  onPress: () => void;
  yuklanmoqda?: boolean;
  o'chirilgan?: boolean;
  ikkinchi?: boolean;
}

// CTA tugma — DESIGN.md: rounded-full, h-52, primary-container
// XATO 2 tuzatish: bosilganda haptics beradi, alert YO'Q
export function Tugma({ sarlavha, onPress, yuklanmoqda, o'chirilgan, ikkinchi }: TugmaProps) {
  const bos = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };
  return (
    <Pressable
      onPress={bos}
      disabled={o'chirilgan || yuklanmoqda}
      className={`h-[52px] rounded-full items-center justify-center ${
        ikkinchi ? 'bg-surface-container border border-outline-variant' : ''
      }`}
      style={({ pressed }) => ({
        backgroundColor: ikkinchi ? ranglar.inputBg : ranglar.asosiy,
        opacity: pressed || o'chirilgan ? 0.85 : 1,
      })}>
      {yuklanmoqda ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className="text-[15px] font-bold" style={{ color: ikkinchi ? ranglar.matn : '#fff' }}>
          {sarlavha}
        </Text>
      )}
    </Pressable>
  );
}
