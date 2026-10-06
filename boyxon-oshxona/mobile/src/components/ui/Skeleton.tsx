import { View, type ViewStyle } from 'react-native';
import { ranglar } from '../../constants/colors';

// Yuklanish skeleti — XATO 15 tuzatish
export function Skelet({ eni = '100%', baland = 16 }: { eni?: ViewStyle['width']; baland?: number }) {
  return (
    <View
      className="rounded-lg opacity-60"
      style={{ width: eni, height: baland, backgroundColor: ranglar.skeleton }}
    />
  );
}

export function SkeletKarta() {
  return (
    <View className="w-[160px] rounded-2xl bg-white p-2" style={{ borderColor: ranglar.border, borderWidth: 1 }}>
      <View className="h-[100px] rounded-xl" style={{ backgroundColor: ranglar.skeleton }} />
      <View className="p-2">
        <Skelet baland={14} />
        <View className="h-2" />
        <Skelet eni="60%" baland={14} />
      </View>
    </View>
  );
}
