import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ranglar } from '../../constants/colors';

// Miqdor stepper — XATO 5: Zustand orqali ishlaydi, DOM YO‘Q
export function MiqdorStepper({
  soni,
  onKamaytir,
  onOshir,
}: {
  soni: number;
  onKamaytir: () => void;
  onOshir: () => void;
}) {
  const bos = (fn: () => void) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fn();
  };
  return (
    <View className="flex-row items-center" style={{ gap: 10 }}>
      <Pressable
        onPress={() => bos(onKamaytir)}
        className="h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: ranglar.inputBg }}>
        <Text className="text-[16px]">−</Text>
      </Pressable>
      <Text className="min-w-[20px] text-center text-[15px] font-bold" style={{ color: ranglar.matn }}>
        {soni}
      </Text>
      <Pressable
        onPress={() => bos(onOshir)}
        className="h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: ranglar.asosiy }}>
        <Text className="text-[16px] text-white">+</Text>
      </Pressable>
    </View>
  );
}
