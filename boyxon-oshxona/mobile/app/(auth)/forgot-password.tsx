import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Maydon } from '../../src/components/ui/Input';
import { Tugma } from '../../src/components/ui/Button';
import { Toast } from '../../src/components/ui/Toast';
import {
  authFoydalanuvchiOlish,
  otpSorash,
  otpTasdiq,
  parolTiklash,
} from '../../src/api/auth.api';
import { tokenlarniSaqlash, useAuth } from '../../src/store/auth.store';
import { telefonFormat } from '../../src/utils/format';
import { telefonSxema } from '../../src/utils/validators';
import { ranglar } from '../../src/constants/colors';
import { xatoXabari } from '../../src/utils/error';

export default function TasdiqlashEkrani() {
  const params = useLocalSearchParams<{ maqsad?: string; telefon?: string }>();
  const royxatTasdiqlash = params.maqsad === 'royxat';
  const [telefon, setTelefon] = useState(typeof params.telefon === 'string' ? params.telefon : '');
  const [kod, setKod] = useState('');
  const [yangiParol, setYangiParol] = useState('');
  const [qadam, setQadam] = useState<1 | 2>(royxatTasdiqlash ? 2 : 1);
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const [xabar, setXabar] = useState<{ matn: string; tur: 'muvaffaqiyat' | 'xato' } | null>(null);
  const authKirish = useAuth((holat) => holat.kirish);

  useEffect(() => {
    if (typeof params.telefon === 'string') setTelefon(params.telefon);
  }, [params.telefon]);

  const kodSorash = async () => {
    if (!telefonSxema.safeParse(telefon).success) {
      setXabar({ matn: 'Telefon raqamini to‘g‘ri kiriting', tur: 'xato' });
      return;
    }

    setYuklanmoqda(true);
    setXabar(null);
    try {
      await otpSorash(telefon, 'tiklash');
      setQadam(2);
      setXabar({ matn: 'Tasdiqlash kodi yuborildi', tur: 'muvaffaqiyat' });
    } catch (xato) {
      setXabar({ matn: xatoXabari(xato, 'Kod yuborilmadi. Qayta urinib ko‘ring'), tur: 'xato' });
    } finally {
      setYuklanmoqda(false);
    }
  };

  const tasdiqlash = async () => {
    if (!/^\d{6}$/.test(kod)) {
      setXabar({ matn: 'Kod 6 xonali bo‘lishi kerak', tur: 'xato' });
      return;
    }
    if (!royxatTasdiqlash && yangiParol.length < 6) {
      setXabar({ matn: 'Yangi parol kamida 6 belgidan iborat bo‘lsin', tur: 'xato' });
      return;
    }

    setYuklanmoqda(true);
    setXabar(null);
    try {
      if (royxatTasdiqlash) {
        const tokenlar = await otpTasdiq(telefon, kod, 'royxat');
        await tokenlarniSaqlash(tokenlar.accessToken, tokenlar.refreshToken);
        const foydalanuvchi = await authFoydalanuvchiOlish();
        await authKirish(foydalanuvchi, tokenlar.accessToken, tokenlar.refreshToken);
        router.replace('/(tabs)' as never);
      } else {
        await parolTiklash(telefon, kod, yangiParol);
        setXabar({ matn: 'Parol yangilandi. Endi hisobingizga kiring.', tur: 'muvaffaqiyat' });
        setTimeout(() => router.replace('/(auth)/login' as never), 1000);
      }
    } catch (xato) {
      if (royxatTasdiqlash) await useAuth.getState().chiqish();
      setXabar({
        matn: xatoXabari(
          xato,
          royxatTasdiqlash ? 'Kod noto‘g‘ri yoki muddati tugagan' : 'Parol tiklanmadi. Kodni tekshiring',
        ),
        tur: 'xato',
      });
    } finally {
      setYuklanmoqda(false);
    }
  };

  return (
    <ScrollView className="flex-1 px-5 pt-16" style={{ backgroundColor: ranglar.surface }}>
      <Text className="text-[24px] font-extrabold" style={{ color: ranglar.matn }}>
        {royxatTasdiqlash ? 'Telefonni tasdiqlash' : 'Parolni tiklash'}
      </Text>
      {xabar ? <View className="mt-3"><Toast matn={xabar.matn} tur={xabar.tur} /></View> : null}
      {qadam === 1 ? (
        <View className="mt-5">
          <Maydon
            yorliq="Telefon"
            placeholder="+998 90 123 45 67"
            keyboardType="phone-pad"
            value={telefon}
            onChangeText={(qiymat) => setTelefon(telefonFormat(qiymat))}
          />
          <Tugma sarlavha="Kod yuborish" onPress={() => void kodSorash()} yuklanmoqda={yuklanmoqda} />
        </View>
      ) : (
        <View className="mt-5">
          <Maydon yorliq="6 xonali kod" placeholder="123456" keyboardType="number-pad" maxLength={6} value={kod} onChangeText={setKod} />
          {!royxatTasdiqlash ? (
            <Maydon yorliq="Yangi parol" placeholder="Kamida 6 belgi" secureTextEntry value={yangiParol} onChangeText={setYangiParol} />
          ) : null}
          <Tugma
            sarlavha={royxatTasdiqlash ? 'Telefonni tasdiqlash' : 'Parolni yangilash'}
            onPress={() => void tasdiqlash()}
            yuklanmoqda={yuklanmoqda}
          />
        </View>
      )}
    </ScrollView>
  );
}
