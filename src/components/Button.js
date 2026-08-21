import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { colors, radius, font } from '../theme/theme';

export default function Button({
  label,
  onPress,
  variant = 'primary', // primary | secondary | outline | ghost
  icon,
  loading = false,
  disabled = false,
  style,
  fullWidth = true,
}) {
  const isDisabled = disabled || loading;
  const containerStyle = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'outline' && styles.outline,
    variant === 'ghost' && styles.ghost,
    fullWidth && { alignSelf: 'stretch' },
    isDisabled && styles.disabled,
    style,
  ];
  const textStyle = [
    styles.text,
    variant === 'primary' && styles.textPrimary,
    variant === 'secondary' && styles.textSecondary,
    variant === 'outline' && styles.textOutline,
    variant === 'ghost' && styles.textGhost,
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={containerStyle}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.deepOcean} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text style={textStyle}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  primary: { backgroundColor: colors.deepOcean },
  secondary: { backgroundColor: colors.turquoise },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.deepOcean },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  text: { fontSize: 15, fontWeight: '600', fontFamily: font.body },
  textPrimary: { color: colors.white },
  textSecondary: { color: colors.white },
  textOutline: { color: colors.deepOcean },
  textGhost: { color: colors.deepOcean },
});
