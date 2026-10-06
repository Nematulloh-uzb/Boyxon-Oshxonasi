import { Text, View } from 'react-native';
import { ranglar } from '../../constants/colors';

// Profil kartasi — Sozlamalar yuqori qismi
export function ProfilKarta({ ism, telefon }: { ism: string; telefon: string }) {
  return (
    <View className="flex-row items-center rounded-2xl bg-white p-4" style={{ borderColor: ranglar.border, borderWidth: 1 }}>
      <View className="h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: ranglar.inputBg }}>
        <Text className="text-[24px]">👤</Text>
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[16px] font-bold" style={{ color: ranglar.matn }}>
          {ism}
        </Text>
        <Text className="text-[13px]" style={{ color: ranglar.matn2 }}>
          {telefon}
        </Text>
      </View>
    </View>
  );
}
