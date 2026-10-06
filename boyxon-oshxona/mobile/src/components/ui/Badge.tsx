import { Text, View } from 'react-native';
import { ranglar } from '../../constants/colors';

// Chip — kichik yorliq (chegirma, vaqt, reyting)
export function Chip({ matn }: { matn: string }) {
  return (
    <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: '#FFDDB3' }}>
      <Text className="text-[11px] font-bold" style={{ color: '#291800' }}>
        {matn}
      </Text>
    </View>
  );
}

// Badge — son ko‘rsatkich (savat soni)
export function Badge({ son }: { son: number }) {
  if (son <= 0) return null;
  return (
    <View
      className="min-w-[20px] items-center justify-center rounded-full px-1"
      style={{ backgroundColor: ranglar.asosiy }}>
      <Text className="text-[11px] font-bold text-white">{son > 99 ? '99+' : String(son)}</Text>
    </View>
  );
}
