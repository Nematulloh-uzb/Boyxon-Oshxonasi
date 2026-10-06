import { Image, Pressable, Text, View } from 'react-native';
import { narxFormat } from '../../utils/format';
import { useSavat, type SavatElement } from '../../store/cart.store';
import { MiqdorStepper } from './QuantityStepper';
import { ranglar } from '../../constants/colors';

// Savat qatori — XATO 5: stepper Zustand orqali
export function SavatQatori({ el }: { el: SavatElement }) {
  const miqdor = useSavat((h) => h.miqdor);
  const ochirish = useSavat((h) => h.ochirish);
  return (
    <View
      className="mt-2 flex-row items-center rounded-2xl bg-white p-2"
      style={{ borderColor: ranglar.border, borderWidth: 1 }}>
      <Image source={{ uri: el.rasmUrl }} className="h-[64px] w-[64px] rounded-xl" />
      <View className="ml-2 flex-1">
        <Text className="text-[14px] font-bold" style={{ color: ranglar.matn }} numberOfLines={1}>
          {el.nom}
        </Text>
        <Text className="text-[13px]" style={{ color: ranglar.matn2 }}>
          {narxFormat(el.narx)}
        </Text>
        <View className="mt-1 flex-row items-center justify-between">
          <MiqdorStepper soni={el.soni} onKamaytir={() => miqdor(el.id, el.soni - 1)} onOshir={() => miqdor(el.id, el.soni + 1)} />
          <Pressable onPress={() => ochirish(el.id)}>
            <Text className="text-[12px]" style={{ color: ranglar.xato }}>
              O‘chirish
            </Text>
          </Pressable>
        </View>
      </View>
      <Text className="text-[14px] font-bold" style={{ color: ranglar.matn }}>
        {narxFormat(el.narx * el.soni)}
      </Text>
    </View>
  );
}
