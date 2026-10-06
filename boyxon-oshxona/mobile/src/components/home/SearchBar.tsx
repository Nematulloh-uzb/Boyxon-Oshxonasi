import { TextInput } from 'react-native';
import { ranglar } from '../../constants/colors';

// Qidiruv paneli — Asosiy ekranda ishlatiladi
export function QidiruvPanel({
  qiymat,
  onChange,
  joy,
}: {
  qiymat: string;
  onChange: (v: string) => void;
  joy: string;
}) {
  return (
    <TextInput
      value={qiymat}
      onChangeText={onChange}
      placeholder={joy}
      placeholderTextColor="#906F6E"
      className="mt-3 h-[48px] rounded-xl px-4"
      style={{ backgroundColor: ranglar.inputBg, borderColor: ranglar.border, borderWidth: 1 }}
    />
  );
}
