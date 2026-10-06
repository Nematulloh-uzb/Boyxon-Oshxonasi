import { Image, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { narxFormat } from '../../utils/format';
import type { Mahsulot } from '../../api/products.api';
import { useSavat } from '../../store/cart.store';
import { ranglar } from '../../constants/colors';

// Mahsulot kartasi — BOSQICH 11: bosilganda spring animatsiya + haptics
// XATO 14: bosilganda router.push('/product/' + id)
export function MahsulotKarta({ m }: { m: Mahsulot }) {
  const qoshish = useSavat((h) => h.qoshish);
  const masshtab = useSharedValue(1);
  const animUslub = useAnimatedStyle(() => ({ transform: [{ scale: masshtab.value }] }));

  const och = () => {
    masshtab.value = withSpring(0.96, { damping: 12 }, () => {
      masshtab.value = withSpring(1);
    });
    router.push(`/product/${m._id}` as never);
  };

  const savatga = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    masshtab.value = withSpring(0.92, { damping: 10 }, () => {
      masshtab.value = withSpring(1);
    });
    qoshish({ id: m._id, nom: m.nom, narx: m.narx, rasmUrl: m.rasmUrl });
  };

  return (
    <Animated.View style={animUslub}>
      <Animated.Pressable onPress={och} className="w-[160px] rounded-2xl bg-white p-2" style={{ borderColor: ranglar.border, borderWidth: 1 }}>
        <Image source={{ uri: m.rasmUrl }} className="h-[100px] w-full rounded-xl" resizeMode="cover" />
        <View className="p-1">
          <Text className="text-[13px] font-bold" style={{ color: ranglar.matn }} numberOfLines={1}>
            {m.nom}
          </Text>
          <Text className="text-[11px]" style={{ color: ranglar.matn2 }}>
            ⭐ {m.reyting} • {m.tayyorlanishVaqti}
          </Text>
          <View className="mt-1 flex-row items-center justify-between">
            <Text className="text-[14px] font-bold" style={{ color: ranglar.matn }}>
              {narxFormat(m.narx)}
            </Text>
            <Animated.Pressable
              onPress={(event) => {
                event.stopPropagation();
                savatga();
              }}
              className="h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: ranglar.asosiy }}>
              <Text className="text-[18px] text-white">+</Text>
            </Animated.Pressable>
          </View>
        </View>
      </Animated.Pressable>
    </Animated.View>
  );
}
