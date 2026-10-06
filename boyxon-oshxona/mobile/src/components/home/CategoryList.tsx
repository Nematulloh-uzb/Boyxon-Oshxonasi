import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ranglar } from '../../constants/colors';
import type { Kategoriya } from '../../api/products.api';

// Kategoriya ro'yxati — XATO 14: bosilganda /category/slug
export function KategoriyaRoyxat({ royxat }: { royxat: Kategoriya[] }) {
  return (
    <FlatList
      horizontal
      data={royxat}
      keyExtractor={(k) => k._id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 12, marginTop: 8 }}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push(`/category/${item.slug}` as never)}
          className="w-[110px] items-center rounded-2xl bg-white p-2"
          style={{ borderColor: ranglar.border, borderWidth: 1 }}>
          <Image source={{ uri: item.rasmUrl }} className="h-[64px] w-[90px] rounded-xl" />
          <Text className="mt-1 text-[12px] font-semibold" style={{ color: ranglar.matn }}>
            {item.nom}
          </Text>
        </Pressable>
      )}
      ListEmptyComponent={
        <View>
          <Text style={{ color: ranglar.matn2 }}>Kategoriya yo‘q</Text>
        </View>
      }
    />
  );
}
