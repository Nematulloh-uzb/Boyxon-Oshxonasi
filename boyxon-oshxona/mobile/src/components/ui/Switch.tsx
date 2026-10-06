import { Switch as RNSwitch } from 'react-native';
import { ranglar } from '../../constants/colors';

// Switch — XATO 10: CSS peer hack o'rniga RN Switch
export function Almash({
  qiymat,
  onAlmash,
}: {
  qiymat: boolean;
  onAlmash: (v: boolean) => void;
}) {
  return (
    <RNSwitch
      value={qiymat}
      onValueChange={onAlmash}
      trackColor={{ false: '#E8E1DA', true: ranglar.asosiy }}
      thumbColor="#fff"
    />
  );
}
