import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { mahsulotBittasi } from '../../src/api/products.api';
import { Tugma } from '../../src/components/ui/Button';
import { Skelet } from '../../src/components/ui/Skeleton';
import { QaytaUrinishXatosi } from '../../src/components/ui/RetryError';
import { narxFormat } from '../../src/utils/format';
import { useSavat } from '../../src/store/cart.store';
import { ranglar } from '../../src/constants/colors';

export default function MahsulotEkrani() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sorov = useQuery({ queryKey: ['mahsulot', id], queryFn: () => mahsulotBittasi(String(id)) });
  const qoshish = useSavat((h) => h.qoshish);

  if (sorov.isLoading) {
    return <View className="flex-1 p-4 pt-14" style={{ backgroundColor: ranglar.surface }}><Skelet baland={220} /><View className="h-3" /><Skelet baland={20} /></View>;
  }
  if (sorov.isError || !sorov.data) {
    return (
      <View className="flex-1 p-4 pt-14" style={{ backgroundColor: ranglar.surface }}>
        <QaytaUrinishXatosi
          matn="Mahsulot yuklanmadi"
          onQayta={() => void sorov.refetch()}
          isLoading={sorov.isFetching}
        />
      </View>
    );
  }
  const m = sorov.data;
  return (
    <ScrollView className="flex-1" style={{ backgroundColor: ranglar.surface }}>
      <Pressable
        onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)' as never)}
        accessibilityRole="button"
        accessibilityLabel="Orqaga"
        className="absolute left-4 top-12 z-10 rounded-full px-3 py-2"
        style={{ backgroundColor: '#FFFFFFE6' }}>
        <Text className="font-bold" style={{ color: ranglar.matn }}>‹ Orqaga</Text>
      </Pressable>
      <Image source={{ uri: m.rasmUrl }} className="h-[280px] w-full" resizeMode="cover" />
      <View className="p-4">
        <Text className="text-[24px] font-extrabold" style={{ color: ranglar.matn }}>{m.nom}</Text>
        <Text className="mt-1 text-[14px]" style={{ color: ranglar.matn2 }}>
          ⭐ {m.reyting} ({m.sharhlarSoni}) • {m.tayyorlanishVaqti}
        </Text>
        <Text className="mt-2 text-[20px] font-bold" style={{ color: ranglar.matn }}>{narxFormat(m.narx)}</Text>
        <Text className="mt-2 text-[14px]" style={{ color: ranglar.matn2 }}>{m.tavsif}</Text>
        <View className="mt-5">
          <Tugma sarlavha="Savatchaga qoshish" onPress={() => qoshish({ id: m._id, nom: m.nom, narx: m.narx, rasmUrl: m.rasmUrl })} />
        </View>
        <View className="h-10" />
      </View>
    </ScrollView>
  );
}
