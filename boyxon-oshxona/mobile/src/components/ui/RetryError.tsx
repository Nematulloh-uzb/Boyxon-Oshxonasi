import { Pressable, Text, View } from 'react-native';
import { ranglar } from '../../constants/colors';
import { Toast } from './Toast';

export function QaytaUrinishXatosi({
  matn,
  onQayta,
  isLoading = false,
}: {
  matn: string;
  onQayta: () => void;
  isLoading?: boolean;
}) {
  return (
    <View>
      <Toast matn={matn} tur="xato" />
      <Pressable
        onPress={onQayta}
        disabled={isLoading}
        accessibilityRole="button"
        className="mt-2 self-start rounded-full px-4 py-2"
        style={{ backgroundColor: ranglar.inputBg, opacity: isLoading ? 0.6 : 1 }}>
        <Text className="font-bold" style={{ color: ranglar.asosiyMatn }}>
          {isLoading ? 'Yuklanmoqda…' : 'Qayta urinish'}
        </Text>
      </Pressable>
    </View>
  );
}
