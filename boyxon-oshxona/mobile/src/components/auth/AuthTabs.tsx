import { Pressable, Text, View } from 'react-native';
import { ranglar } from '../../constants/colors';

// Kirish / Ro'yxat tab almashtirgich
export function AuthTablar({
  faol,
  onAlmash,
}: {
  faol: 'kirish' | 'royxat';
  onAlmash: (v: 'kirish' | 'royxat') => void;
}) {
  return (
    <View className="flex-row rounded-full p-1" style={{ backgroundColor: ranglar.inputBg }}>
      {(['kirish', 'royxat'] as const).map((v) => (
        <Pressable
          key={v}
          onPress={() => onAlmash(v)}
          className="flex-1 items-center rounded-full py-2.5"
          style={{ backgroundColor: faol === v ? '#fff' : 'transparent' }}>
          <Text className="text-[14px] font-bold" style={{ color: ranglar.matn }}>
            {v === 'kirish' ? 'Kirish' : 'Ro‘yxat'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
