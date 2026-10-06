import { TextInput, View } from 'react-native';
import { ranglar } from '../../constants/colors';

// 6 xonali OTP — faqat raqam (XATO 6)
export function OtpKiritish({ qiymat, onChange }: { qiymat: string; onChange: (v: string) => void }) {
  return (
    <View className="items-center">
      <TextInput
        value={qiymat}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="123456"
        placeholderTextColor="#906F6E"
        className="h-[56px] w-[200px] rounded-xl text-center text-[22px] font-bold tracking-[8px]"
        style={{ backgroundColor: ranglar.inputBg, borderColor: ranglar.border, borderWidth: 1, color: ranglar.matn }}
      />
    </View>
  );
}
