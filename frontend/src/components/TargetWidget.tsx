import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../constants';
import { TargetIcon } from './Icons';

interface Props {
  targetAmount: number;
  achieved: number;
  progress: number;
  achievedText?: string;
}

export default function TargetWidget({ targetAmount, achieved, progress, achievedText }: Props) {
  const pct = Math.min(Math.max(progress, 0), 100);
  const achievedPct = targetAmount > 0 ? Math.min((achieved / targetAmount) * 100, 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <TargetIcon size={20} color={colors.primary} />
          <Text style={styles.label}>Target Harian</Text>
        </View>
        <Text style={styles.percent}>{Math.round(pct)}%</Text>
      </View>

      <View style={styles.amounts}>
        <Text style={styles.amount}>Rp {achieved.toLocaleString('id-ID')}</Text>
        <Text style={styles.target}>dari target Rp {targetAmount.toLocaleString('id-ID')}</Text>
      </View>

      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${achievedPct}%` }]} />
      </View>

      {achievedText && (
        <Text style={styles.status}>{achievedText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  percent: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  amounts: {
    marginBottom: spacing.md,
  },
  amount: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  target: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  barTrack: {
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  status: {
    marginTop: spacing.sm,
    fontSize: fontSize.xs,
    color: colors.success,
    fontWeight: fontWeight.medium,
  },
});