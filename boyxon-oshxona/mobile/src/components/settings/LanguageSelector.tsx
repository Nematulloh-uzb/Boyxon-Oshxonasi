import { Pressable, Text, View } from 'react-native';
import { useSozlama, type Til } from '../../store/settings.store';
import { ranglar } from '../../constants/colors';

// Til tanlash — XATO 11: real i18n bilan
const TILLAR: { kod: Til; nom: string }[] = [
  { kod: 'uz', nom: 'O‘zbek' },
  { kod: 'ru', nom: 'Русский' },
  { kod: 'en', nom: 'English' },
];

export function TilTanlash() {
  const til = useSozlama((h) => h.til);
  const tilAlmash = useSozlama((h) => h.tilAlmash);
  return (
    <View className="flex-row" style={{ gap: 8 }}>
      {TILLAR.map((v) => (
        <Pressable
          key={v.kod}
          onPress={() => tilAlmash(v.kod)}
          className="flex-1 items-center rounded-xl py-3"
          style={{
            backgroundColor: til === v.kod ? ranglar.asosiy : '#fff',
            borderColor: ranglar.border,
            borderWidth: 1,
          }}>
          <Text className="font-bold" style={{ color: til === v.kod ? '#fff' : ranglar.matn }}>
            {v.nom}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
