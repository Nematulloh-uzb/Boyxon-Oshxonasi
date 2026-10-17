import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from './Icon';

interface InputProps {
  label?: string;
  icon?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  error?: string | null;
  rightElement?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  editable?: boolean;
  returnKeyType?: 'done' | 'next' | 'go' | 'search' | 'send';
  onSubmitEditing?: () => void;
}

/** Dizayn 01/04: h-12, radius 12px, leading icon, focus'da oq fon + orange ring. */
export function Input({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  autoCorrect = false,
  error,
  rightElement,
  style,
  editable = true,
  returnKeyType,
  onSubmitEditing,
}: InputProps) {
  const theme = useTheme();
  const { colors } = theme;
  const [focused, setFocused] = useState(false);

  return (
    <View style={style}>
      {label ? (
        <Text style={[theme.typography.labelSm, { color: colors.onSurfaceVariant, marginBottom: 6 }]}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.box,
          {
            backgroundColor: focused ? colors.surfaceContainerLowest : colors.surfaceContainerLow,
            borderColor: error
              ? colors.error
              : focused
                ? colors.primaryContainer
                : 'transparent',
            borderWidth: focused || error ? 2 : 0,
          },
        ]}
      >
        {icon ? (
          <Icon
            name={icon}
            size={20}
            color={focused ? colors.primary : colors.outline}
          />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.outline}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={editable}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            theme.typography.bodyMd,
            styles.input,
            { color: colors.onSurface, marginLeft: icon ? 10 : 0 },
          ]}
        />
        {rightElement}
      </View>
      {error ? (
        <Text style={[theme.typography.bodySm, { color: colors.error, marginTop: 4 }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
  },
});
