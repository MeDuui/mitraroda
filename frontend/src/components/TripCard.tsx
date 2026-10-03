import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight, formatTime } from '../constants';

interface Props {
  gross: number;
  tip: number;
  paymentType: 'cash' | 'non-cash';
  createdAt: string;
}

export default function TripCard({ gross, tip, paymentType, createdAt }: Props) {
  const isCash = paymentType === 'cash';

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={[styles.badge, isCash ? styles.badgeCash : styles.badgeNonCash]}>
          <Text style={[styles.badgeText, isCash ? styles.badgeTextCash : styles.badgeTextNonCash]}>
            {isCash ? 'Tunai' : 'Non-Tunai'}
          </Text>
        </View>
        <Text style={styles.time}>{formatTime(createdAt)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.gross}>+Rp {gross.toLocaleString('id-ID')}</Text>
        {tip > 0 && (
          <Text style={styles.tip}>+ tip Rp {tip.toLocaleString('id-ID')}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  badgeCash: {
    backgroundColor: colors.successLight,
  },
  badgeNonCash: {
    backgroundColor: colors.surfaceAlt,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  badgeTextCash: {
    color: colors.success,
  },
  badgeTextNonCash: {
    color: colors.textSecondary,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  right: {
    alignItems: 'flex-end',
  },
  gross: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.success,
  },
  tip: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});