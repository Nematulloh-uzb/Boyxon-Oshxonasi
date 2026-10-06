import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import type { z } from 'zod';
import { Maydon } from '../../src/components/ui/Input';
import { Tugma } from '../../src/components/ui/Button';
import { Toast } from '../../src/components/ui/Toast';
import { royxatdanOtish } from '../../src/api/auth.api';
import { royxatSxema } from '../../src/utils/validators';
import { telefonFormat } from '../../src/utils/format';
import { ranglar } from '../../src/constants/colors';
import { xatoXabari } from '../../src/utils/error';

type RoyxatForma = z.infer<typeof royxatSxema>;

export default function RoyxatEkrani() {
  const [xabar, setXabar] = useState<{ matn: string; tur: 'muvaffaqiyat' | 'xato' } | null>(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const { control, handleSubmit, setValue, watch } = useForm<RoyxatForma>({
    resolver: zodResolver(royxatSxema),
    defaultValues: { ism: '', telefon: '', parol: '', tasdiq: '' },
  });
  const tel = watch('telefon');

  const yuborish = async (v: RoyxatForma) => {
    setYuklanmoqda(true);
    try {
      await royxatdanOtish(v.ism, v.telefon, v.parol);
      setXabar({ matn: 'Kod yuborildi!', tur: 'muvaffaqiyat' });
      router.push(
        `/(auth)/forgot-password?maqsad=royxat&telefon=${encodeURIComponent(v.telefon)}` as never,
      );
    } catch (xato) {
      setXabar({ matn: xatoXabari(xato, 'Ro‘yxatdan o‘tishda xatolik yuz berdi'), tur: 'xato' });
    } finally {
      setYuklanmoqda(false);
    }
  };

  return (
    <ScrollView className="flex-1 px-5 pt-16" style={{ backgroundColor: ranglar.surface }}>
      <Text className="text-[26px] font-extrabold" style={{ color: ranglar.matn }}>Royxatdan otish</Text>
      {xabar ? <View className="mt-3"><Toast matn={xabar.matn} tur={xabar.tur} /></View> : null}
      <View className="mt-5">
        <Controller control={control} name="ism" render={({ field: { value, onChange }, fieldState }) => (
          <Maydon yorliq="Ismingiz" placeholder="Aziz" value={value} onChangeText={onChange} xato={fieldState.error?.message} />
        )} />
        <Controller control={control} name="telefon" render={({ fieldState }) => (
          <Maydon yorliq="Telefon" placeholder="+998 90 123 45 67" keyboardType="phone-pad" value={tel} onChangeText={(t) => setValue('telefon', telefonFormat(t), { shouldValidate: true })} xato={fieldState.error?.message} />
        )} />
        <Controller control={control} name="parol" render={({ field: { value, onChange }, fieldState }) => (
          <Maydon yorliq="Parol" placeholder="••••••" secureTextEntry value={value} onChangeText={onChange} xato={fieldState.error?.message} />
        )} />
        <Controller control={control} name="tasdiq" render={({ field: { value, onChange }, fieldState }) => (
          <Maydon yorliq="Parolni takrorlang" placeholder="••••••" secureTextEntry value={value} onChangeText={onChange} xato={fieldState.error?.message} />
        )} />
      </View>
      <Tugma sarlavha="Davom etish" onPress={() => void handleSubmit(yuborish)()} yuklanmoqda={yuklanmoqda} />
    </ScrollView>
  );
}
