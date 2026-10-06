import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { ranglar } from '../../constants/colors';

interface MaydonProps extends TextInputProps {
  yorliq: string;
  xato?: string;
}

// Forma maydoni — xato matni bilan (Zod bilan ishlaydi)
export function Maydon({ yorliq, xato, ...qolgan }: MaydonProps) {
  return (
    <View className="mb-3">
      <Text className="mb-1 text-[13px] font-semibold" style={{ color: ranglar.matn2 }}>
        {yorliq}
      </Text>
      <TextInput
        className="h-[52px] rounded-xl px-4 text-[15px]"
        placeholderTextColor="#906F6E"
        style={{
          backgroundColor: ranglar.inputBg,
          borderWidth: 1,
          borderColor: xato ? ranglar.xato : ranglar.border,
          color: ranglar.matn,
        }}
        {...qolgan}
      />
      {xato ? <Text className="mt-1 text-[12px]" style={{ color: ranglar.xato }}>{xato}</Text> : null}
    </View>
  );
}
