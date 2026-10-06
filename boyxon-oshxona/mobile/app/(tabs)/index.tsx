import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SalomSarlavha } from '../../src/components/home/GreetingHeader';
import { QidiruvPanel } from '../../src/components/home/SearchBar';
import { PromoBanner } from '../../src/components/home/PromoBanner';
import { KategoriyaRoyxat } from '../../src/components/home/CategoryList';
import { MashhurBolim } from '../../src/components/home/PopularSection';
import { Toast } from '../../src/components/ui/Toast';
import { QaytaUrinishXatosi } from '../../src/components/ui/RetryError';
import { Skelet } from '../../src/components/ui/Skeleton';
import { narxFormat } from '../../src/utils/format';
import { useKategoriyalar, useQidiruv } from '../../src/hooks/useProducts';
import { useTil } from '../../src/hooks/useI18n';
import { ranglar } from '../../src/constants/colors';

// Asosiy ekran — komponentlarga bo'lingan (XATO 3, 9, 13, 14, 15)
// BOSQICH 12: matnlar useTil() orqali (uz/ru/en)
export default function Asosiy() {
  const { t } = useTil();
  const [qidiruv, setQidiruv] = useState('');
  const [nusxaXabar, setNusxaXabar] = useState(false);
  const [nusxaXato, setNusxaXato] = useState(false);

  const katlar = useKategoriyalar();
  const qidirilgan = useQidiruv(qidiruv);

  useEffect(() => {
    if (!nusxaXabar && !nusxaXato) return;
    const taymer = setTimeout(() => {
      setNusxaXabar(false);
      setNusxaXato(false);
    }, nusxaXato ? 3000 : 2000);
    return () => clearTimeout(taymer);
  }, [nusxaXabar, nusxaXato]);

  const promoNusxalandi = () => {
    setNusxaXabar(true);
    setNusxaXato(false);
  };

  const promoNusxalanmadi = () => {
    setNusxaXato(true);
  };

  return (
    <ScrollView className="flex-1 px-4 pt-12" style={{ backgroundColor: ranglar.surface }}>
      <SalomSarlavha />
      <QidiruvPanel qiymat={qidiruv} onChange={setQidiruv} joy={t('qidiruv')} />

      {/* Promo banner — XATO 9 (expo-clipboard ichida) */}
      <PromoBanner
        onNusxa={promoNusxalandi}
        onXato={promoNusxalanmadi}
      />
      {nusxaXabar ? (
        <View className="mt-2">
          <Toast matn="Promo-kod nusxalandi!" tur="muvaffaqiyat" />
        </View>
      ) : null}
      {nusxaXato ? (
        <View className="mt-2">
          <Toast matn="Promo-kodni nusxalab bo‘lmadi" tur="xato" />
        </View>
      ) : null}

      {/* Kategoriyalar — XATO 14 */}
      <View className="mt-5">
        <Text className="text-[17px] font-bold" style={{ color: ranglar.matn }}>
          Kategoriyalar
        </Text>
        {katlar.isLoading ? (
          <View className="mt-2"><Skelet baland={70} /></View>
        ) : katlar.isError ? (
          <View className="mt-2">
            <QaytaUrinishXatosi matn="Kategoriyalar yuklanmadi" onQayta={() => void katlar.refetch()} isLoading={katlar.isFetching} />
          </View>
        ) : (
          <KategoriyaRoyxat royxat={katlar.data ?? []} />
        )}
      </View>

      {/* Mashhur — XATO 15 ichida */}
      <View className="mt-5">
        <MashhurBolim sarlavha={t('mashhur')} barchasiMatn={t('barchasi')} />
      </View>

      {/* Qidiruv natijasi */}
      {qidiruv.trim().length > 1 ? (
        <View className="pb-10">
          <Text className="mt-3 text-[15px] font-bold" style={{ color: ranglar.matn }}>
            Natijalar: {qidirilgan.data?.length ?? 0}
          </Text>
          {qidirilgan.isLoading ? <View className="mt-3"><Skelet baland={64} /></View> : null}
          {qidirilgan.isError ? (
            <View className="mt-3">
              <QaytaUrinishXatosi
                matn="Qidiruv natijalarini yuklab bo‘lmadi"
                onQayta={() => void qidirilgan.refetch()}
                isLoading={qidirilgan.isFetching}
              />
            </View>
          ) : null}
          {!qidirilgan.isLoading && !qidirilgan.isError && (qidirilgan.data ?? []).length === 0 ? (
            <Text className="mt-2 text-[13px]" style={{ color: ranglar.matn2 }}>Bu so‘rov bo‘yicha taom topilmadi</Text>
          ) : null}
          {(qidirilgan.data ?? []).map((m) => (
            <Pressable
              key={m._id}
              onPress={() => router.push(`/product/${m._id}` as never)}
              accessibilityRole="button"
              accessibilityLabel={m.nom}
              className="mt-2 flex-row items-center rounded-2xl bg-white p-2"
              style={{ borderColor: ranglar.border, borderWidth: 1 }}>
              <Image source={{ uri: m.rasmUrl }} className="h-[56px] w-[56px] rounded-xl" />
              <View className="ml-2 flex-1">
                <Text className="text-[14px] font-bold" style={{ color: ranglar.matn }}>{m.nom}</Text>
                <Text className="text-[13px]" style={{ color: ranglar.matn2 }}>{narxFormat(m.narx)}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}
