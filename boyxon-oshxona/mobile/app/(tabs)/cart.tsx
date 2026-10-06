import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSavat } from '../../src/store/cart.store';
import { useSavatHisob } from '../../src/hooks/useCart';
import { promoTekshir } from '../../src/api/products.api';
import { buyurtmaYarat, type BuyurtmaYaratish } from '../../src/api/orders.api';
import { Tugma } from '../../src/components/ui/Button';
import { BoshHolat } from '../../src/components/ui/EmptyState';
import { Toast } from '../../src/components/ui/Toast';
import { SavatQatori } from '../../src/components/cart/CartItem';
import { BuyurtmaXulosa } from '../../src/components/cart/OrderSummary';
import { ranglar } from '../../src/constants/colors';
import { telefonFormat } from '../../src/utils/format';
import { telefonSxema } from '../../src/utils/validators';
import { useAuth } from '../../src/store/auth.store';
import { xatoXabari } from '../../src/utils/error';

export default function Savatcha() {
  const elementlar = useSavat((h) => h.elementlar);
  const promoQoyish = useSavat((h) => h.promoQoyish);
  const promoOchirish = useSavat((h) => h.promoOchirish);
  const foydalanuvchi = useAuth((h) => h.foydalanuvchi);
  const queryMijoz = useQueryClient();
  const { soni, oraliq, yetkazish, jami, promoKod, chegirma } = useSavatHisob();
  const [kod, setKod] = useState('');
  const [manzil, setManzil] = useState('');
  const [telefon, setTelefon] = useState(foydalanuvchi?.telefon ?? '');
  const [izoh, setIzoh] = useState('');
  const [xabar, setXabar] = useState<{ matn: string; tur: 'muvaffaqiyat' | 'xato' } | null>(null);

  useEffect(() => {
    if (!telefon && foydalanuvchi?.telefon) setTelefon(foydalanuvchi.telefon);
  }, [foydalanuvchi?.telefon, telefon]);

  const promoMut = useMutation({
    mutationFn: (qiymat: { kod: string; summa: number }) => promoTekshir(qiymat.kod, qiymat.summa),
    onSuccess: (d, qiymat) => {
      if (oraliq !== qiymat.summa) {
        setXabar({ matn: 'Savatcha o‘zgardi. Promo-kodni qayta tekshiring.', tur: 'xato' });
        return;
      }
      promoQoyish(qiymat.kod, d.chegirma);
      setXabar({ matn: 'Promo-kod qo‘llandi', tur: 'muvaffaqiyat' });
    },
    onError: (xato) => setXabar({ matn: xatoXabari(xato, 'Promo-kod yaroqsiz'), tur: 'xato' }),
  });

  const buyurtmaMut = useMutation({
    mutationFn: (buyurtma: BuyurtmaYaratish) => buyurtmaYarat(buyurtma),
    onSuccess: (_javob, yuborilganBuyurtma) => {
      for (const qator of yuborilganBuyurtma.mahsulotlar) {
        const hozirgi = useSavat.getState().elementlar.find((el) => el.id === qator.mahsulot);
        if (hozirgi) {
          useSavat.getState().miqdor(qator.mahsulot, hozirgi.soni - qator.soni);
        }
      }
      void queryMijoz.invalidateQueries({ queryKey: ['buyurtmalar'] });
      router.push('/orders' as never);
    },
    onError: (xato) => setXabar({ matn: xatoXabari(xato, 'Buyurtma yuborilmadi'), tur: 'xato' }),
  });

  if (elementlar.length === 0) {
    return (
      <View className="flex-1 pt-16" style={{ backgroundColor: ranglar.surface }}>
        <BoshHolat sarlavha="Savatcha bosh" izoh="Mazali taomlarni koring!" tugma="Taomlarni korish" onPress={() => router.push('/(tabs)' as never)} />
      </View>
    );
  }

  const buyurtmaBerish = () => {
    if (!foydalanuvchi) {
      setXabar({ matn: 'Buyurtma berish uchun avval tizimga kiring', tur: 'xato' });
      router.push('/(auth)/login' as never);
      return;
    }
    if (manzil.trim().length < 6 || !telefonSxema.safeParse(telefon).success) {
      setXabar({ matn: 'Manzil va telefon raqamini to‘g‘ri kiriting', tur: 'xato' });
      return;
    }
    buyurtmaMut.mutate({
      mahsulotlar: elementlar.map((e) => ({ mahsulot: e.id, soni: e.soni })),
      manzil: manzil.trim(),
      telefon,
      tolovUsuli: 'naqd',
      promoKod: promoKod ?? undefined,
      izoh: izoh.trim() || undefined,
    });
  };

  return (
    <ScrollView className="flex-1 px-4 pt-12" style={{ backgroundColor: ranglar.surface }}>
      <Text className="text-[22px] font-extrabold" style={{ color: ranglar.matn }}>
        Savatcha ({soni})
      </Text>
      {xabar ? <View className="mt-2"><Toast matn={xabar.matn} tur={xabar.tur} /></View> : null}
      <View className="mt-3 rounded-2xl bg-white p-3" style={{ borderColor: ranglar.border, borderWidth: 1 }}>
        <Text className="mb-1 text-[13px] font-semibold" style={{ color: ranglar.matn2 }}>Yetkazib berish manzili</Text>
        <TextInput
          value={manzil}
          onChangeText={setManzil}
          placeholder="Shahar, ko‘cha, uy raqami"
          placeholderTextColor={ranglar.matn2}
          accessibilityLabel="Yetkazib berish manzili"
          className="min-h-[48px] rounded-xl px-3"
          style={{ backgroundColor: ranglar.inputBg, color: ranglar.matn }}
        />
        <Text className="mb-1 mt-3 text-[13px] font-semibold" style={{ color: ranglar.matn2 }}>Telefon raqami</Text>
        <TextInput
          value={telefon}
          onChangeText={(qiymat) => setTelefon(telefonFormat(qiymat))}
          placeholder="+998 90 123 45 67"
          placeholderTextColor={ranglar.matn2}
          accessibilityLabel="Telefon raqami"
          keyboardType="phone-pad"
          className="h-[48px] rounded-xl px-3"
          style={{ backgroundColor: ranglar.inputBg, color: ranglar.matn }}
        />
        <Text className="mb-1 mt-3 text-[13px] font-semibold" style={{ color: ranglar.matn2 }}>Izoh (ixtiyoriy)</Text>
        <TextInput
          value={izoh}
          onChangeText={setIzoh}
          placeholder="Yetkazib berish bo‘yicha qo‘shimcha ma’lumot"
          placeholderTextColor={ranglar.matn2}
          accessibilityLabel="Buyurtma izohi"
          className="min-h-[48px] rounded-xl px-3"
          style={{ backgroundColor: ranglar.inputBg, color: ranglar.matn }}
        />
      </View>
      {elementlar.map((e) => (
        <SavatQatori key={e.id} el={e} />
      ))}
      <View className="mt-3 flex-row" style={{ gap: 8 }}>
        <TextInput
          value={kod}
          editable={!promoMut.isPending}
          onChangeText={(qiymat) => {
            setKod(qiymat);
            if (promoKod) promoOchirish();
          }}
          placeholder="Promo-kod (BOYXON20)"
          autoCapitalize="characters"
          accessibilityLabel="Promo-kod"
          className="h-[48px] flex-1 rounded-xl px-4"
          style={{ backgroundColor: '#fff', borderColor: ranglar.border, borderWidth: 1 }}
        />
        <Pressable
          disabled={!promoKod && (!kod.trim() || promoMut.isPending)}
          onPress={() =>
            promoKod
              ? promoOchirish()
              : promoMut.mutate({ kod: kod.trim().toUpperCase(), summa: oraliq })
          }
          className="h-[48px] items-center justify-center rounded-xl px-4"
          style={{ backgroundColor: ranglar.aksent, opacity: !promoKod && !kod.trim() ? 0.6 : 1 }}>
          <Text className="font-bold">{promoKod ? 'Olib tashlash' : promoMut.isPending ? 'Tekshirilmoqda…' : 'Qo‘llash'}</Text>
        </Pressable>
      </View>
      <View className="mt-3">
        <BuyurtmaXulosa oraliq={oraliq} yetkazish={yetkazish} chegirma={chegirma} promoKod={promoKod} jami={jami} />
      </View>
      <View className="mt-4 pb-10">
        <Tugma sarlavha="Buyurtma berish" onPress={buyurtmaBerish} yuklanmoqda={buyurtmaMut.isPending} />
      </View>
    </ScrollView>
  );
}
