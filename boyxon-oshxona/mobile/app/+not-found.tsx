import { Text, View } from 'react-native';
import { Link } from 'expo-router';
import { ranglar } from '../src/constants/colors';

export default function Topilmadi() {
  return (
    <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: ranglar.surface }}>
      <Text className="text-[64px]">🍲</Text>
      <Text className="mt-3 text-center text-[22px] font-extrabold" style={{ color: ranglar.matn }}>
        Sahifa topilmadi
      </Text>
      <Text className="mt-1 text-center text-[14px]" style={{ color: ranglar.matn2 }}>
        Bunday manzil yo‘q. Asosiy sahifaga qayting.
      </Text>
      <Link href="/(tabs)" style={{ marginTop: 16, color: ranglar.asosiyMatn, fontWeight: '700' }}>
        Asosiy sahifa
      </Link>
    </View>
  );
}
