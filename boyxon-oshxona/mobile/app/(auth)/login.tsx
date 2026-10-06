import { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { Maydon } from '../../src/components/ui/Input';
import { Tugma } from '../../src/components/ui/Button';
import { Toast } from '../../src/components/ui/Toast';
import { kirish } from '../../src/api/auth.api';
import { useAuth } from '../../src/store/auth.store';
import { kirishSxema } from '../../src/utils/validators';
import { telefonFormat } from '../../src/utils/format';
import { ranglar } from '../../src/constants/colors';
import type { z } from 'zod';
import { xatoXabari } from '../../src/utils/error';

type KirishForma = z.infer<typeof kirishSxema>;

// Kirish — auth yo‘li aniq, asosiy tab index bilan to‘qnashmaydi.
export default function KirishEkrani() {
  const [xabar, setXabar] = useState<{ matn: string; tur: 'muvaffaqiyat' | 'xato' } | null>(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const authKirish = useAuth((h) => h.kirish);
  const { control, handleSubmit, setValue, watch } = useForm<KirishForma>({
    resolver: zodResolver(kirishSxema),
    defaultValues: { telefon: '', parol: '' },
  });
  const tel = watch('telefon');

  const yuborish = async (v: KirishForma) => {
    setYuklanmoqda(true);
    setXabar(null);
    try {
      const javob = await kirish(v.telefon, v.parol);
      await authKirish(javob.foydalanuvchi, javob.accessToken, javob.refreshToken);
      router.replace('/(tabs)' as never);
    } catch (xato) {
      setXabar({ matn: xatoXabari(xato, 'Tizimga kirishda xatolik yuz berdi'), tur: 'xato' });
    } finally {
      setYuklanmoqda(false);
    }
  };

  // XATO 7: Telegram OAuth
  const telegramKirish = async () => {
    await Linking.openURL('https://t.me/boyxon_bot');
  };

  return (
    <ScrollView className="flex-1 px-5 pt-16" style={{ backgroundColor: ranglar.surface }}>
      <Text className="text-[28px] font-extrabold" style={{ color: ranglar.matn }}>
        Xush kelibsiz! 👋
      </Text>
      <Text className="mt-1 text-[14px]" style={{ color: ranglar.matn2 }}>
        Davom etish uchun kiring
      </Text>
      {xabar ? <View className="mt-3"><Toast matn={xabar.matn} tur={xabar.tur} /></View> : null}

      <View className="mt-5">
        <Controller
          control={control}
          name="telefon"
          render={({ fieldState }) => (
            <Maydon
              yorliq="Telefon raqam"
              placeholder="+998 90 123 45 67"
              keyboardType="phone-pad"
              value={tel}
              onChangeText={(t) => setValue('telefon', telefonFormat(t), { shouldValidate: true })}
              xato={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="parol"
          render={({ field: { value, onChange }, fieldState }) => (
            <Maydon yorliq="Parol" placeholder="••••••" secureTextEntry value={value} onChangeText={onChange} xato={fieldState.error?.message} />
          )}
        />
      </View>

      <Tugma sarlavha="Kirish" onPress={() => void handleSubmit(yuborish)()} yuklanmoqda={yuklanmoqda} />

      <Pressable onPress={() => void telegramKirish()} className="mt-3 h-[52px] items-center justify-center rounded-full" style={{ backgroundColor: '#229ED9' }}>
        <Text className="font-bold text-white">Telegram botini ochish</Text>
      </Pressable>

      <View className="mt-4 flex-row justify-between">
        <Link href={'/(auth)/forgot-password' as never}><Text style={{ color: ranglar.asosiyMatn }}>Parolni unutdingizmi?</Text></Link>
        <Link href={'/(auth)/register' as never}><Text style={{ color: ranglar.asosiyMatn }}>Royxatdan otish</Text></Link>
      </View>
    </ScrollView>
  );
}
