import { Pressable, Text, View } from 'react-native';
import { ranglar } from '../../constants/colors';

// Manzil kartasi — savatchada yetkazish manzili
export function ManzilKarta({
  nom,
  manzil,
  tanlangan,
  onPress,
}: {
  nom: string;
  manzil: string;
  tanlangan?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl bg-white p-3"
      style={{ borderColor: tanlangan ? ranglar.asosiy : ranglar.border, borderWidth: tanlangan ? 2 : 1 }}>
      <Text className="text-[14px] font-bold" style={{ color: ranglar.matn }}>
        📍 {nom}
      </Text>
      <Text className="mt-0.5 text-[13px]" style={{ color: ranglar.matn2 }}>
        {manzil}
      </Text>
    </Pressable>
  );
}

// Bo'sh savat — Empty state
export function BoshSavat({ onPress }: { onPress: () => void }) {
  return (
    <View className="items-center justify-center px-8 py-12">
      <Text className="text-[56px]">🧺</Text>
      <Text className="mt-3 text-[18px] font-bold" style={{ color: ranglar.matn }}>
        Savatcha bo‘sh
      </Text>
      <Text className="mt-1 text-center text-[14px]" style={{ color: ranglar.matn2 }}>
        Mazali taomlarni ko‘ring!
      </Text>
      <Pressable onPress={onPress} className="mt-4 rounded-full px-6 py-3" style={{ backgroundColor: ranglar.asosiy }}>
        <Text className="font-bold text-white">Taomlarni ko‘rish</Text>
      </Pressable>
    </View>
  );
}
