import { Text, View } from 'react-native';
import { ranglar } from '../../constants/colors';

export type ToastTuri = 'muvaffaqiyat' | 'xato' | 'info';

// XATO 2 tuzatish: alert() o'rniga shu Toast ishlatiladi
export function Toast({ matn, tur = 'info' }: { matn: string; tur?: ToastTuri }) {
  const fon = tur === 'muvaffaqiyat' ? ranglar.yashilBg : tur === 'xato' ? ranglar.xatoBg : ranglar.inputBg;
  const matnRang = tur === 'muvaffaqiyat' ? ranglar.yashil : tur === 'xato' ? ranglar.xato : ranglar.matn;
  return (
    <View className="rounded-xl px-4 py-3" style={{ backgroundColor: fon }}>
      <Text className="text-[14px] font-medium" style={{ color: matnRang }}>
        {matn}
      </Text>
    </View>
  );
}
