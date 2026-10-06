import { FlatList, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MahsulotKarta } from './ProductCard';
import { SkeletKarta } from '../ui/Skeleton';
import { QaytaUrinishXatosi } from '../ui/RetryError';
import { BolimSarlavha } from '../ui/Card';
import { useMashhurlar } from '../../hooks/useProducts';
import type { Mahsulot } from '../../api/products.api';

// Mashhur bo'lim — XATO 15 holatlari bilan
export function MashhurBolim({ sarlavha, barchasiMatn }: { sarlavha: string; barchasiMatn: string }) {
  const sorov = useMashhurlar();
  if (sorov.isLoading) {
    return (
      <View style={{ gap: 0 }}>
        <BolimSarlavha sarlavha={sarlavha} />
        <View className="mt-2 flex-row" style={{ gap: 12 }}>
          <SkeletKarta />
          <SkeletKarta />
        </View>
      </View>
    );
  }
  if (sorov.isError) {
    return (
      <View>
        <BolimSarlavha sarlavha={sarlavha} />
        <View className="mt-2">
          <QaytaUrinishXatosi
            matn="Mashhur taomlar yuklanmadi"
            onQayta={() => void sorov.refetch()}
            isLoading={sorov.isFetching}
          />
        </View>
      </View>
    );
  }
  const royxat = (sorov.data ?? []) as Mahsulot[];
  return (
    <View>
      <BolimSarlavha sarlavha={sarlavha} barchasi={barchasiMatn} onBarchasi={() => router.push('/category/oshlar' as never)} />
      <FlatList
        horizontal
        data={royxat}
        keyExtractor={(m) => m._id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, marginTop: 8 }}
        renderItem={({ item }) => <MahsulotKarta m={item} />}
        ListEmptyComponent={<Text>Hozircha mashhur taomlar yo‘q</Text>}
      />
    </View>
  );
}
