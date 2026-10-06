import { Text, View, type ViewProps } from 'react-native';
import { ranglar } from '../../constants/colors';

// Karta — DESIGN.md: rounded-2xl, oq fon, ingichka chegara
export function Karta({ children, ...qolgan }: ViewProps) {
  return (
    <View
      className="rounded-2xl bg-white p-3"
      style={{ borderColor: ranglar.border, borderWidth: 1 }}
      {...qolgan}>
      {children}
    </View>
  );
}

// Bo'lim sarlavhasi — "Mashhur taomlar" + "Barchasi →"
export function BolimSarlavha({ sarlavha, barchasi, onBarchasi }: { sarlavha: string; barchasi?: string; onBarchasi?: () => void }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-[17px] font-bold" style={{ color: ranglar.matn }}>
        {sarlavha}
      </Text>
      {barchasi ? (
        <Text onPress={onBarchasi} className="text-[13px] font-semibold" style={{ color: ranglar.asosiyMatn }}>
          {barchasi} →
        </Text>
      ) : null}
    </View>
  );
}
