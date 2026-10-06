import { Modal, Pressable, Text, View } from 'react-native';
import { ranglar } from '../../constants/colors';
import { Tugma } from './Button';

// Modal — XATO 2: confirm() o'rniga shu ishlatiladi
export function TasdiqModal({
  korinadi,
  sarlavha,
  izoh,
  tasdiqMatn = 'Ha',
  bekorMatn = 'Yoq',
  onTasdiq,
  onBekor,
}: {
  korinadi: boolean;
  sarlavha: string;
  izoh: string;
  tasdiqMatn?: string;
  bekorMatn?: string;
  onTasdiq: () => void;
  onBekor: () => void;
}) {
  return (
    <Modal visible={korinadi} transparent animationType="fade" onRequestClose={onBekor}>
      <Pressable onPress={onBekor} className="flex-1 items-center justify-center bg-black/40 px-8">
        <Pressable onPress={(event) => event.stopPropagation()} className="w-full rounded-3xl bg-white p-5">
          <Text className="text-[18px] font-bold" style={{ color: ranglar.matn }}>
            {sarlavha}
          </Text>
          <Text className="mt-1 text-[14px]" style={{ color: ranglar.matn2 }}>
            {izoh}
          </Text>
          <View className="mt-4" style={{ gap: 8 }}>
            <Tugma sarlavha={tasdiqMatn} onPress={onTasdiq} />
            <Tugma sarlavha={bekorMatn} onPress={onBekor} ikkinchi />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
