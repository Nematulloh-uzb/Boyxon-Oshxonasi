import { Pressable, Switch, Text, View, type ReactNode } from 'react-native';
import { ranglar } from '../../constants/colors';

// Sozlama bo'limi sarlavhasi
export function SozlamaBolim({ sarlavha, children }: { sarlavha: string; children: ReactNode }) {
  return (
    <View className="mt-4">
      <Text className="mb-2 text-[15px] font-bold" style={{ color: ranglar.matn }}>
        {sarlavha}
      </Text>
      <View className="rounded-2xl bg-white" style={{ borderColor: ranglar.border, borderWidth: 1 }}>
        {children}
      </View>
    </View>
  );
}

// Sozlama qatori — XATO 10: RN Switch bilan
export function SozlamaQator({
  nom,
  qiymat,
  onAlmash,
  oxirgi,
}: {
  nom: string;
  qiymat: boolean;
  onAlmash: (v: boolean) => void;
  oxirgi?: boolean;
}) {
  return (
    <View
      className="flex-row items-center justify-between px-4 py-3"
      style={{ borderBottomWidth: oxirgi ? 0 : 1, borderBottomColor: ranglar.border }}>
      <Text className="text-[15px]" style={{ color: ranglar.matn }}>
        {nom}
      </Text>
      <Switch value={qiymat} onValueChange={onAlmash} trackColor={{ false: '#E8E1DA', true: ranglar.asosiy }} />
    </View>
  );
}

// Bosiladigan qator
export function HavolaQator({ nom, onPress, oxirgi }: { nom: string; onPress: () => void; oxirgi?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-3"
      style={{ borderBottomWidth: oxirgi ? 0 : 1, borderBottomColor: ranglar.border }}>
      <Text className="text-[15px]" style={{ color: ranglar.matn }}>
        {nom}
      </Text>
      <Text style={{ color: ranglar.matn2 }}>›</Text>
    </Pressable>
  );
}
