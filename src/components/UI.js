import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, font, shadow, gradients } from '../theme/theme';
import GlassSurface from './GlassSurface';
import Logo from './Logo';

export function Card({ children, style, onPress }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper activeOpacity={0.9} onPress={onPress} style={[styles.card, style]}>
      {children}
    </Wrapper>
  );
}

export function SectionHeader({ title, subtitle, actionLabel, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function Badge({ label, tone = 'neutral' }) {
  const toneStyles = {
    neutral: { bg: colors.sandLight, fg: colors.charcoal },
    success: { bg: '#E4F1E9', fg: colors.success },
    warning: { bg: '#F6E9DE', fg: '#9A5B26' },
    info: { bg: '#E1F2F1', fg: colors.turquoiseDark },
    gold: { bg: '#F5EBD3', fg: '#8A6C25' },
    error: { bg: '#F8E2DE', fg: colors.error },
  };
  const toneStyle = toneStyles[tone] || toneStyles.neutral;
  return (
    <View style={[styles.badge, { backgroundColor: toneStyle.bg }]}>
      <Text style={[styles.badgeText, { color: toneStyle.fg }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

// Fully controlled by `value` — no internal state to desync from it. An
// earlier version mirrored `value` into local state on mount and then
// rendered only that local copy whenever `onChange` was provided, which
// meant the displayed rating could visually show a selection while the
// value actually being submitted by the parent (e.g. FeedbackScreen) had
// silently reverted to unset.
export function StarRating({ value, onChange, size = 26, readOnly = false }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity
          key={i}
          disabled={readOnly}
          activeOpacity={0.7}
          onPress={() => onChange && onChange(i)}
        >
          <Ionicons
            name={i <= (value || 0) ? 'star' : 'star-outline'}
            size={size}
            color={colors.gold}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function ScreenHeader({ title, onBack, right }) {
  // Frosted-glass header chrome. Screens stack SafeAreaView > ScreenHeader >
  // ScrollView normally (nothing scrolls underneath it), so this is a
  // lighter-touch "glass" treatment: a translucent/frosted panel with a
  // soft edge, not a truly floating header with content blurring behind it.
  return (
    <View style={styles.screenHeaderShadowWrap}>
      <GlassSurface
        style={styles.screenHeaderGlass}
        borderRadius={0}
        intensity={26}
        tint="light"
      >
        <View style={styles.screenHeaderLogoBand}>
          <Logo size="sm" />
        </View>
        <View style={styles.screenHeader}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={colors.deepOcean} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
          )}
          <Text style={styles.screenHeaderTitle} numberOfLines={1}>{title}</Text>
          <View style={styles.backBtn}>{right}</View>
        </View>
      </GlassSurface>
    </View>
  );
}

export function EmptyState({ icon = 'compass-outline', title, subtitle, actionLabel, onAction }) {
  return (
    <View style={styles.empty}>
      <LinearGradient colors={['#E1F2F1', '#F4ECDC']} style={styles.emptyIconWrap}>
        <Ionicons name={icon} size={32} color={colors.turquoiseDark} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
      {actionLabel ? (
        <TouchableOpacity style={styles.emptyBtn} onPress={onAction} activeOpacity={0.85}>
          <Text style={styles.emptyBtnText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function ErrorState({ title, subtitle, onRetry }) {
  const { t } = useTranslation();
  return (
    <View style={styles.empty}>
      <LinearGradient colors={['#F7E7E1', '#FBF0EC']} style={styles.emptyIconWrap}>
        <Ionicons name="alert-circle-outline" size={32} color={colors.error} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>{title || t('common.somethingWrong')}</Text>
      <Text style={styles.emptySubtitle}>{subtitle || t('common.pleaseTryAgain')}</Text>
      {onRetry ? (
        <TouchableOpacity style={styles.emptyBtn} onPress={onRetry} activeOpacity={0.85}>
          <Text style={styles.emptyBtnText}>{t('common.tryAgain')}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function OfflineBanner() {
  const { t } = useTranslation();
  return (
    <View style={styles.offline}>
      <Ionicons name="cloud-offline-outline" size={16} color={colors.white} />
      <Text style={styles.offlineText}>{t('common.offline')}</Text>
    </View>
  );
}

export function IconTile({ label, icon, iconSet = 'ion', onPress, color }) {
  const IconComp = iconSet === 'mci' ? MaterialCommunityIcons : Ionicons;
  return (
    <TouchableOpacity style={styles.iconTile} activeOpacity={0.85} onPress={onPress}>
      <View style={[styles.iconTileCircle, color && { backgroundColor: color }]}>
        <IconComp name={icon} size={22} color={colors.white} />
      </View>
      <Text style={styles.iconTileLabel} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Field({ label, value, onChangeText, placeholder, multiline, keyboardType, secureTextEntry }) {
  const inputRef = useRef(null);
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        ref={inputRef}
        style={[styles.input, multiline && { height: 100, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.slate}
        multiline={multiline}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        returnKeyType={multiline ? 'default' : 'done'}
        blurOnSubmit={!multiline}
        onSubmitEditing={multiline ? undefined : () => inputRef.current?.blur()}
      />
    </View>
  );
}

export function Pill({ label, selected, onPress }) {
  // Rebuilt defensively after category-filter labels were reported invisible
  // on real devices with no reproducible cause found in code review: plain
  // merged style objects instead of `cond && style` array entries, no
  // numberOfLines truncation, and the pill sized only to its own text
  // (flexShrink: 0, alignSelf: 'flex-start') so it's never asked to
  // collapse inside the horizontal ScrollView row.
  const pillStyle = selected ? { ...styles.pill, ...styles.pillSelected } : styles.pill;
  const textStyle = selected ? { ...styles.pillText, ...styles.pillTextSelected } : styles.pillText;
  return (
    <TouchableOpacity onPress={onPress} style={pillStyle} activeOpacity={0.85}>
      <Text style={textStyle}>{label || ''}</Text>
    </TouchableOpacity>
  );
}

export function KpiCard({ label, value, sub, style }) {
  return (
    <Card style={[{ flexBasis: '48%', marginBottom: spacing.sm }, style]}>
      <Text style={kpiStyles.label}>{label}</Text>
      <Text style={kpiStyles.value}>{value}</Text>
      {sub ? <Text style={kpiStyles.sub}>{sub}</Text> : null}
    </Card>
  );
}

export function ProgressBar({ percent, tone = 'info' }) {
  const toneColor = {
    neutral: colors.slate, success: colors.success, warning: '#9A5B26',
    info: colors.turquoiseDark, error: colors.error, gold: colors.gold,
  }[tone];
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <View style={{ height: 6, backgroundColor: colors.sandLight, borderRadius: 3, overflow: 'hidden' }}>
      <View style={{ width: `${clamped}%`, height: '100%', backgroundColor: toneColor }} />
    </View>
  );
}

export function timeAgo(iso) {
  if (!iso) return '—';
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  return `${Math.round(hrs / 24)} d ago`;
}

const kpiStyles = StyleSheet.create({
  label: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.5, color: colors.slate, textTransform: 'uppercase' },
  value: { fontFamily: font.display, fontSize: 24, fontWeight: '600', color: colors.deepOcean, marginTop: 4 },
  sub: { fontSize: 11.5, color: colors.slate, marginTop: 4 },
});

export function SkeletonBlock({ width = '100%', height = 16, style }) {
  return <View style={[{ width, height, borderRadius: radius.sm, backgroundColor: '#E7E1D2' }, style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(228,220,201,0.6)',
    ...shadow.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: 19, fontWeight: '700', color: colors.charcoal, fontFamily: font.display, letterSpacing: 0.1 },
  sectionSubtitle: { fontSize: 12.5, color: colors.slate, marginTop: 3, lineHeight: 17 },
  sectionAction: { fontSize: 13, fontWeight: '700', color: colors.turquoiseDark },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3, flexShrink: 1 },
  screenHeaderShadowWrap: {
    ...shadow.card,
  },
  screenHeaderGlass: {
    borderWidth: 0,
    borderBottomWidth: 1,
  },
  screenHeaderLogoBand: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xs,
    paddingBottom: 2,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  screenHeaderTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: colors.charcoal },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  emptyIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
    ...shadow.card,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.charcoal, textAlign: 'center', fontFamily: font.display },
  emptySubtitle: { fontSize: 14, color: colors.slate, textAlign: 'center', marginTop: 6, lineHeight: 20, maxWidth: 280 },
  emptyBtn: {
    marginTop: spacing.lg, backgroundColor: colors.deepOcean, paddingHorizontal: 24, paddingVertical: 13,
    borderRadius: radius.pill, ...shadow.soft,
  },
  emptyBtnText: { color: colors.white, fontWeight: '700', fontSize: 13, letterSpacing: 0.2 },
  offline: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.charcoal, paddingVertical: 8,
  },
  offlineText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  iconTile: { width: '25%', alignItems: 'center', marginBottom: spacing.lg, paddingHorizontal: 4 },
  iconTileCircle: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.deepOcean,
    alignItems: 'center', justifyContent: 'center', marginBottom: 7,
    ...shadow.card,
  },
  iconTileLabel: { fontSize: 11.5, color: colors.charcoal, textAlign: 'center', fontWeight: '600' },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: colors.charcoal, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.charcoal,
    backgroundColor: colors.white,
  },
  pill: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, marginRight: 8,
    alignSelf: 'flex-start', flexShrink: 0,
  },
  pillSelected: { backgroundColor: colors.deepOcean, borderColor: colors.deepOcean },
  pillText: { fontSize: 13, fontWeight: '600', color: colors.charcoal },
  pillTextSelected: { color: colors.white },
});
