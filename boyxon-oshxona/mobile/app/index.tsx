import { Redirect, router } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { ranglar } from '../src/constants/colors';
import { useAuth } from '../src/store/auth.store';

export default function BoshlangichYol() {
  const tayyormi = useAuth((holat) => holat.tayyormi);
  const foydalanuvchi = useAuth((holat) => holat.foydalanuvchi);
  const yuklashXatosi = useAuth((holat) => holat.yuklashXatosi);
  const yuklash = useAuth((holat) => holat.yuklash);

  if (!tayyormi) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: ranglar.surface }}>
        <ActivityIndicator size="large" color={ranglar.asosiy} />
      </View>
    );
  }

  if (yuklashXatosi) {
    return (
      <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: ranglar.surface }}>
        <Text className="text-center text-[15px]" style={{ color: ranglar.xato }}>{yuklashXatosi}</Text>
        <Pressable onPress={() => void yuklash()} className="mt-4 rounded-full px-6 py-3" style={{ backgroundColor: ranglar.asosiy }}>
          <Text className="font-bold text-white">Qayta urinish</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            void useAuth.getState().chiqish()
              .then(() => router.replace('/(auth)/login' as never))
              .catch((xato: unknown) => {
                useAuth.setState({
                  yuklashXatosi: xato instanceof Error ? xato.message : 'Saqlangan hisobni tozalab bo‘lmadi.',
                });
              });
          }}
          className="mt-3 rounded-full px-6 py-3">
          <Text className="font-bold" style={{ color: ranglar.asosiy }}>Saqlangan hisobni tozalash</Text>
        </Pressable>
      </View>
    );
  }

  return <Redirect href={foydalanuvchi ? '/(tabs)' : '/(auth)/login'} />;
}
