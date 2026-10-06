import { Text, View } from 'react-native';
import { narxFormat } from '../../utils/format';
import { ranglar } from '../../constants/colors';

// Buyurtma xulosasi — XATO 4: qiymatlar props orqali, qo‘lda yozilmaydi
export function BuyurtmaXulosa({
  oraliq,
  yetkazish,
  chegirma,
  promoKod,
  jami,
}: {
  oraliq: number;
  yetkazish: number;
  chegirma: number;
  promoKod: string | null;
  jami: number;
}) {
  return (
    <View className="rounded-2xl bg-white p-4" style={{ borderColor: ranglar.border, borderWidth: 1 }}>
      <Qator nom="Oraliq jami" qiymat={narxFormat(oraliq)} />
      <Qator nom="Yetkazish" qiymat={yetkazish === 0 ? 'Bepul' : narxFormat(yetkazish)} />
      {promoKod ? <Qator nom={`Chegirma (${promoKod})`} qiymat={`−${narxFormat(chegirma)}`} /> : null}
      <View className="my-2 h-[1px]" style={{ backgroundColor: ranglar.border }} />
      <Qator nom="Jami" qiymat={narxFormat(jami)} katta />
    </View>
  );
}

function Qator({ nom, qiymat, katta }: { nom: string; qiymat: string; katta?: boolean }) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text className={katta ? 'text-[16px] font-bold' : 'text-[14px]'} style={{ color: ranglar.matn }}>
        {nom}
      </Text>
      <Text className={katta ? 'text-[16px] font-bold' : 'text-[14px] font-semibold'} style={{ color: ranglar.matn }}>
        {qiymat}
      </Text>
    </View>
  );
}
