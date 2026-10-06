import { FlatList, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { mahsulotOlish } from '../../src/api/products.api';
import { MahsulotKarta } from '../../src/components/home/ProductCard';
import { SkeletKarta } from '../../src/components/ui/Skeleton';
import { QaytaUrinishXatosi } from '../../src/components/ui/RetryError';
import { ranglar } from '../../src/constants/colors';

// XATO 14: "Barchasi →" shu yerga olib keladi
export default function KategoriyaEkrani() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sorov = useQuery({ queryKey: ['kat', id], queryFn: () => mahsulotOlish({ kategoriya: id }) });

  return (
    <View className="flex-1 px-4 pt-12" style={{ backgroundColor: ranglar.surface }}>
      <Pressable
        onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)' as never)}
        accessibilityRole="button"
        accessibilityLabel="Orqaga"
        className="mb-2 self-start rounded-full px-3 py-2"
        style={{ backgroundColor: ranglar.inputBg }}>
        <Text style={{ color: ranglar.matn }}>‹ Orqaga</Text>
      </Pressable>
      <Text className="text-[22px] font-extrabold" style={{ color: ranglar.matn }}>{id}</Text>
      {sorov.isLoading ? (
        <View className="mt-3 flex-row" style={{ gap: 12 }}><SkeletKarta /><SkeletKarta /></View>
      ) : sorov.isError ? (
        <View className="mt-3">
          <QaytaUrinishXatosi matn="Taomlar yuklanmadi" onQayta={() => void sorov.refetch()} isLoading={sorov.isFetching} />
        </View>
      ) : (
        <FlatList
          data={sorov.data ?? []}
          numColumns={2}
          keyExtractor={(m) => m._id}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 12, paddingVertical: 12 }}
          renderItem={({ item }) => <MahsulotKarta m={item} />}
          ListEmptyComponent={<Text style={{ color: ranglar.matn2 }}>Bu yerda hozircha taom yoq</Text>}
        />
      )}
    </View>
  );
}
