import { FlatList, Pressable, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { buyurtmalarim } from '../src/api/orders.api';
import { Skelet } from '../src/components/ui/Skeleton';
import { QaytaUrinishXatosi } from '../src/components/ui/RetryError';
import { BoshHolat } from '../src/components/ui/EmptyState';
import { narxFormat } from '../src/utils/format';
import { ranglar } from '../src/constants/colors';
import { router } from 'expo-router';
import { useAuth } from '../src/store/auth.store';
import { xatoXabari } from '../src/utils/error';

// Buyurtmalar tarixi — himoyalangan, token bilan
export default function Buyurtmalar() {
  const foydalanuvchi = useAuth((holat) => holat.foydalanuvchi);
  const sorov = useQuery({
    queryKey: ['buyurtmalar'],
    queryFn: buyurtmalarim,
    enabled: !!foydalanuvchi,
  });

  if (!foydalanuvchi) {
    return (
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: ranglar.surface }}>
        <Text className="text-center text-[18px] font-bold" style={{ color: ranglar.matn }}>
          Buyurtmalarni ko‘rish uchun hisobga kiring
        </Text>
        <Pressable onPress={() => router.replace('/(auth)/login' as never)} className="mt-4 rounded-full px-6 py-3" style={{ backgroundColor: ranglar.asosiy }}>
          <Text className="font-bold text-white">Kirish</Text>
        </Pressable>
      </View>
    );
  }

  if (sorov.isLoading) {
    return (
      <View className="flex-1 p-4 pt-14" style={{ backgroundColor: ranglar.surface }}>
        <Skelet baland={80} />
        <View className="h-2" />
        <Skelet baland={80} />
      </View>
    );
  }

  if (sorov.isError) {
    return (
      <View className="flex-1 p-4 pt-14" style={{ backgroundColor: ranglar.surface }}>
        <QaytaUrinishXatosi
          matn={xatoXabari(sorov.error, 'Buyurtmalar yuklanmadi')}
          onQayta={() => void sorov.refetch()}
          isLoading={sorov.isFetching}
        />
      </View>
    );
  }

  const royxat = (sorov.data ?? []) as { _id: string; raqam: string; jami: number; holat: string }[];
  if (royxat.length === 0) {
    return (
      <View className="flex-1 pt-14" style={{ backgroundColor: ranglar.surface }}>
        <BoshHolat
          sarlavha="Hali buyurtma yo'q"
          izoh="Birinchi buyurtmangizni bering!"
          tugma="Taomlarni ko'rish"
          onPress={() => router.push('/(tabs)' as never)}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 px-4 pt-12" style={{ backgroundColor: ranglar.surface }}>
      <Text className="text-[22px] font-extrabold" style={{ color: ranglar.matn }}>
        Buyurtmalarim
      </Text>
      <FlatList
        data={royxat}
        keyExtractor={(b) => b._id}
        contentContainerStyle={{ gap: 8, paddingVertical: 12 }}
        renderItem={({ item }) => (
          <View className="rounded-2xl bg-white p-3" style={{ borderColor: ranglar.border, borderWidth: 1 }}>
            <Text className="text-[15px] font-bold" style={{ color: ranglar.matn }}>
              {item.raqam}
            </Text>
            <Text className="text-[13px]" style={{ color: ranglar.matn2 }}>
              {item.holat} • {narxFormat(item.jami)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
