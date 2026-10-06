import { Text, View } from 'react-native';
import { savatSoni, useSavat } from '../../store/cart.store';
import { ranglar } from '../../constants/colors';

// Tab ikonkasi — savatda badge bilan
export function TabIkonka({ emoji, savat }: { emoji: string; savat?: boolean }) {
  const soni = useSavat(savatSoni);
  return (
    <View className="items-center">
      <Text className="text-[22px]">{emoji}</Text>
      {savat && soni > 0 ? (
        <View
          className="absolute -right-3 -top-1 min-w-[18px] items-center rounded-full px-1"
          style={{ backgroundColor: ranglar.asosiy }}>
          <Text className="text-[10px] font-bold text-white">{soni > 99 ? '99+' : String(soni)}</Text>
        </View>
      ) : null}
    </View>
  );
}
