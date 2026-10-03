import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { PieChart } from 'react-native-chart-kit';
import { colors, spacing, borderRadius, fontSize, fontWeight, getToday } from '../../src/constants';
import { summaryService } from '../../src/services/dataService';
import AddExpenseModal from '../../src/components/AddExpenseModal';
import { expenseService } from '../../src/services/dataService';
import { GasIcon, FoodIcon, ParkingIcon, MoreIcon, PlusIcon, TrendingUpIcon } from '../../src/components/Icons';
import { Summary, emptySummary } from '../../src/types';
import { Alert } from 'react-native';

const screenWidth = Dimensions.get('window').width - spacing.lg * 2;

const categoryMeta = {
  fuel: { label: 'Bensin', icon: GasIcon, color: '#3b82f6' },
  food: { label: 'Makan', icon: FoodIcon, color: '#f59e0b' },
  parking: { label: 'Parkir', icon: ParkingIcon, color: '#8b5cf6' },
  other: { label: 'Lainnya', icon: MoreIcon, color: '#6b7280' },
} as const;

export default function AnalyticsScreen() {
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await summaryService.getByDate(getToday());
      setSummary(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleAddExpense = async (category: 'fuel' | 'food' | 'parking' | 'other', amount: number) => {
    setSubmitting(true);
    try {
      await expenseService.create({ category, amount, date: getToday() });
      setShowExpenseModal(false);
      await loadData();
    } catch (err) {
      Alert.alert('Gagal', 'Tidak dapat menyimpan pengeluaran.');
    } finally {
      setSubmitting(false);
    }
  };

  const pieData = [
    {
      name: 'Pemasukan',
      amount: summary.total_income,
      color: colors.primary,
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    },
    {
      name: 'Biaya',
      amount: summary.total_expenses,
      color: colors.success,
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    },
  ];

  const cashData = summary.payment_breakdown.find((p) => p.payment_type === 'cash')?.total || 0;
  const nonCashData = summary.payment_breakdown.find((p) => p.payment_type === 'non-cash')?.total || 0;
  const hasPayment = cashData + nonCashData > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Analisis</Text>
        <Text style={styles.subtitle}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.primary} />}
      >
        {/* Donut chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Arus Kas</Text>
          {loading || (summary.total_income === 0 && summary.total_expenses === 0) ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Belum ada data</Text>
              <Text style={styles.emptyText}>Catat trip dan pengeluaran untuk melihat analisis.</Text>
            </View>
          ) : (
            <PieChart
              data={pieData}
              width={screenWidth - spacing.lg * 2}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                labelColor: () => colors.textSecondary,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="0"
              absolute
            />
          )}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>Pemasukan: Rp {summary.total_income.toLocaleString('id-ID')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>Biaya: Rp {summary.total_expenses.toLocaleString('id-ID')}</Text>
            </View>
          </View>
        </View>

        {/* Pembayaran Tunai vs Non-Tunai */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Metode Pembayaran</Text>
          {hasPayment ? (
            <View style={styles.paymentCompare}>
              <View style={styles.paymentColumn}>
                <Text style={styles.paymentValue}>Rp {cashData.toLocaleString('id-ID')}</Text>
                <Text style={styles.paymentLabel}>Tunai</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.paymentColumn}>
                <Text style={styles.paymentValue}>Rp {nonCashData.toLocaleString('id-ID')}</Text>
                <Text style={styles.paymentLabel}>Non-Tunai</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.mutedText}>Belum ada data pembayaran hari ini.</Text>
          )}
        </View>

        {/* Rincian Biaya */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Biaya Operasional</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowExpenseModal(true)}>
              <PlusIcon size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
          {summary.expense_breakdown.length === 0 ? (
            <Text style={styles.mutedText}>Belum ada pengeluaran hari ini.</Text>
          ) : (
            summary.expense_breakdown.map(({ category, total }) => {
              const meta = categoryMeta[category as keyof typeof categoryMeta] || categoryMeta.other;
              const Icon = meta.icon;
              return (
                <View key={category} style={styles.expenseRow}>
                  <View style={styles.expenseLabel}>
                    <Icon size={18} color={meta.color} />
                    <Text style={styles.expenseName}>{meta.label}</Text>
                  </View>
                  <Text style={styles.expenseAmount}>Rp {total.toLocaleString('id-ID')}</Text>
                </View>
              );
            })
          )}
        </View>

        {/* Jam produktif - placeholder notes */}
        <View style={styles.card}>
          <View style={styles.busyHeader}>
            <TrendingUpIcon size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Jam Produktif</Text>
          </View>
          <Text style={styles.mutedText}>Analisis jam narik tersedia setelah data minimal 7 hari.</Text>
        </View>
      </ScrollView>

      <AddExpenseModal
        visible={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSubmit={handleAddExpense}
        submitting={submitting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  legendRow: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  paymentCompare: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentColumn: {
    flex: 1,
    alignItems: 'center',
  },
  paymentValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  paymentLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 48,
    backgroundColor: colors.border,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  expenseLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  expenseName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  expenseAmount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  mutedText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  busyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
});