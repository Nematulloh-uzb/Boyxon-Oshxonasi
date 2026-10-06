import { Text, View } from 'react-native';
import { useAuth } from '../../store/auth.store';
import { ranglar } from '../../constants/colors';

// Salomlash sarlavhasi — Asosiy ekran yuqori qismi
export function SalomSarlavha() {
  const foydalanuvchi = useAuth((h) => h.foydalanuvchi);
  return (
    <View>
      <Text className="text-[14px]" style={{ color: ranglar.matn2 }}>
        Assalomu alaykum{foydalanuvchi ? `, ${foydalanuvchi.ism}` : ''}! 👋
      </Text>
      <Text className="text-[24px] font-extrabold" style={{ color: ranglar.matn }}>
        Bugun nima yeymiz?
      </Text>
    </View>
  );
}
