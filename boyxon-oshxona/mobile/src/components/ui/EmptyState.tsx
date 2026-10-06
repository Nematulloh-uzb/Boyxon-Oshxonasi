import { Text, View } from 'react-native';
import { Tugma } from './Button';
import { ranglar } from '../../constants/colors';

// Bo'sh holat — XATO 15 (rasm + sarlavha + CTA)
export function BoshHolat({
  sarlavha,
  izoh,
  tugma,
  onPress,
}: {
  sarlavha: string;
  izoh: string;
  tugma: string;
  onPress: () => void;
}) {
  return (
    <View className="items-center justify-center px-8 py-12">
      <View className="h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: ranglar.inputBg }}>
        <Text className="text-[36px]">🍽️</Text>
      </View>
      <Text className="mt-4 text-center text-[18px] font-bold" style={{ color: ranglar.matn }}>
        {sarlavha}
      </Text>
      <Text className="mt-1 text-center text-[14px]" style={{ color: ranglar.matn2 }}>
        {izoh}
      </Text>
      <View className="mt-5 w-full">
        <Tugma sarlavha={tugma} onPress={onPress} />
      </View>
    </View>
  );
}
