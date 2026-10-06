import { Pressable, ScrollView, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useSozlama } from '../../src/store/settings.store';
import { useAuth } from '../../src/store/auth.store';
import { useTil } from '../../src/hooks/useI18n';
import { ProfilKarta } from '../../src/components/settings/ProfileCard';
import { TilTanlash } from '../../src/components/settings/LanguageSelector';
import { SozlamaBolim, SozlamaQator } from '../../src/components/settings/SettingsRow';
import { ranglar } from '../../src/constants/colors';
import { useChiqish } from '../../src/hooks/useAuth';
import { useState } from 'react';
import { Toast } from '../../src/components/ui/Toast';
import { xatoXabari } from '../../src/utils/error';

// Sozlamalar — XATO 10, 11 tuzatish: Switch + real i18n (BOSQICH 12)
export default function Sozlamalar() {
  const { bildirishnoma, bildirishAlmash } = useSozlama();
  const { t } = useTil();
  const foydalanuvchi = useAuth((h) => h.foydalanuvchi);
  const chiqish = useChiqish();
  const [xabar, setXabar] = useState<{ matn: string; tur: 'muvaffaqiyat' | 'xato' } | null>(null);

  const promoNusxa = async () => {
    try {
      await Clipboard.setStringAsync('BOYXON20');
      setXabar({ matn: 'Promo-kod nusxalandi', tur: 'muvaffaqiyat' });
    } catch (xato) {
      setXabar({ matn: xatoXabari(xato, 'Promo-kodni nusxalab bo‘lmadi'), tur: 'xato' });
    }
  };

  return (
    <ScrollView className="flex-1 px-4 pt-12" style={{ backgroundColor: ranglar.surface }}>
      <Text className="text-[22px] font-extrabold" style={{ color: ranglar.matn }}>
        {t('sozlamalar')}
      </Text>
      {xabar ? <View className="mt-3"><Toast matn={xabar.matn} tur={xabar.tur} /></View> : null}
      <View className="mt-3">
        <ProfilKarta ism={foydalanuvchi?.ism ?? 'Mehmon'} telefon={foydalanuvchi?.telefon ?? '+998 -- --- -- --'} />
      </View>

      <Text className="mt-4 text-[15px] font-bold" style={{ color: ranglar.matn }}>{t('til')}</Text>
      <View className="mt-2">
        <TilTanlash />
      </View>

      <SozlamaBolim sarlavha="Bildirishnomalar">
        <SozlamaQator nom="Bildirishnomalar" qiymat={bildirishnoma} onAlmash={bildirishAlmash} oxirgi />
      </SozlamaBolim>

      <Pressable onPress={promoNusxa} className="mt-3 rounded-2xl p-4" style={{ backgroundColor: '#FFDDB3' }}>
        <Text className="font-bold" style={{ color: ranglar.matn }}>BOYXON20 — bosib nusxalang</Text>
      </Pressable>

      {foydalanuvchi ? (
        <Pressable onPress={() => void chiqish()} className="mt-4 items-center rounded-full py-4" style={{ backgroundColor: ranglar.inputBg }}>
          <Text className="font-bold" style={{ color: ranglar.xato }}>Chiqish</Text>
        </Pressable>
      ) : (
        <Pressable onPress={() => router.push('/(auth)/login' as never)} className="mt-4 items-center rounded-full py-4" style={{ backgroundColor: ranglar.asosiy }}>
          <Text className="font-bold text-white">Hisobga kirish</Text>
        </Pressable>
      )}
      <View className="h-10" />
    </ScrollView>
  );
}
