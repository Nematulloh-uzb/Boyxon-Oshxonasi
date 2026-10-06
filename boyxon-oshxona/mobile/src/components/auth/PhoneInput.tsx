import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Maydon } from '../ui/Input';
import { telefonFormat } from '../../utils/format';
import { ranglar } from '../../constants/colors';

// Telefon kiritish — avtomatik +998 formatlaydi (XATO 8)
export function TelefonKiritish({
  qiymat,
  onChange,
  xato,
}: {
  qiymat: string;
  onChange: (v: string) => void;
  xato?: string;
}) {
  return (
    <Maydon
      yorliq="Telefon raqam"
      placeholder="+998 90 123 45 67"
      keyboardType="phone-pad"
      value={qiymat}
      onChangeText={(t) => onChange(telefonFormat(t))}
      xato={xato}
    />
  );
}

// Parol kiritish — ko‘rsatish/yashirish bilan
export function ParolKiritish({
  qiymat,
  onChange,
  xato,
  yorliq = 'Parol',
}: {
  qiymat: string;
  onChange: (v: string) => void;
  xato?: string;
  yorliq?: string;
}) {
  const [korinadi, setKorinadi] = useState(false);
  return (
    <View>
      <Maydon
        yorliq={yorliq}
        placeholder="••••••"
        secureTextEntry={!korinadi}
        value={qiymat}
        onChangeText={onChange}
        xato={xato}
      />
      <Pressable onPress={() => setKorinadi((v) => !v)} className="absolute right-4 top-[38px]">
        <Text style={{ color: ranglar.asosiyMatn }}>{korinadi ? 'Yashirish' : 'Ko‘rsatish'}</Text>
      </Pressable>
    </View>
  );
}
