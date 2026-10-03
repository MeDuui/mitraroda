import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { colors, spacing, borderRadius, fontSize, fontWeight, getToday, formatDate } from '../../src/constants';
import { tripService, expenseService, summaryService } from '../../src/services/dataService';
import TripCard from '../../src/components/TripCard';
import TargetWidget from '../../src/components/TargetWidget';
import { DownloadIcon, CheckCircleIcon } from '../../src/components/Icons';
import { Trip, Expense, Summary, emptySummary } from '../../src/types';

type Filter = 'hari' | 'minggu' | 'bulan';

export default function HistoryScreen() {
  const [filter, setFilter] = useState<Filter>('hari');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      let date = getToday();
      if (filter === 'minggu') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        date = d.toISOString().split('T')[0];
      } else if (filter === 'bulan') {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        date = d.toISOString().split('T')[0];
      }

      const [t, ex, sum] = await Promise.all([
        tripService.getAll(),
        expenseService.getAll(),
        summaryService.getByDate(date),
      ]);

      // Filter trips/expenses client-side by date range
      const filteredTrips = filterTripsByDate(t, filter);
      const filteredExpenses = filterExpensesByDate(ex, filter);

      setTrips(filteredTrips);
      setExpenses(filteredExpenses);
      setSummary(sum);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filterTripsByDate = (allTrips: Trip[], f: Filter): Trip[] => {
    const cutoff = new Date();
    if (f === 'minggu') cutoff.setDate(cutoff.getDate() - 7);
    else if (f === 'bulan') cutoff.setMonth(cutoff.getMonth() - 1);
    else cutoff.setHours(0, 0, 0, 0);

    return allTrips
      .filter((t) => new Date(t.date + 'T00:00:00') >= cutoff)
      .sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at));
  };

  const filterExpensesByDate = (all: Expense[], f: Filter): Expense[] => {
    const cutoff = new Date();
    if (f === 'minggu') cutoff.setDate(cutoff.getDate() - 7);
    else if (f === 'bulan') cutoff.setMonth(cutoff.getMonth() - 1);
    else cutoff.setHours(0, 0, 0, 0);

    return all
      .filter((e) => new Date(e.date + 'T00:00:00') >= cutoff)
      .sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at));
  };

  const exportPdf = () => {
    // Will use backend /export endpoint when deployed
    Alert.alert(
      'Ekspor PDF',
      'Fitur ekspor PDF akan tersedia setelah backend dirilis. Data lengkap: ' + (trips.length + expenses.length) + ' transaksi.'
    );
  };

  const totalIncome = trips.reduce((sum, t) => sum + t.gross_income + t.tip, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netIncome = totalIncome - totalExpenses;

  const generateSummaryText = () => {
    const lines = [
      'MitraRoda - Ringkasan Pembukuan',
      'Periode: ' + (filter === 'hari' ? 'Hari Ini' : filter === 'minggu' ? '7 Hari' : '1 Bulan'),
      '',
      `Pemasukan Kotor: Rp ${formatCurrency(totalIncome)}`,
      `Total Biaya: Rp ${formatCurrency(totalExpenses)}`,
      `Laba Bersih: Rp ${formatCurrency(Math.max(netIncome, 0))}`,
      '',
      `Jumlah Trip: ${trips.length} trip`,
      `Jumlah Pengeluaran: ${expenses.length} transaksi`,
    ];
    return lines.join('\n');
  };

  const formatCurrency = (amount: number) => amount.toLocaleString('id-ID');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Riwayat</Text>
        <Text style={styles.subtitle}>Transaksi & capaian target</Text>
      </View>

      <View style={styles.filterRow}>
        {(['hari', 'minggu', 'bulan'] as Filter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'hari' ? 'Hari Ini' : f === 'minggu' ? '7 Hari' : '1 Bulan'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.primary} />}
      >
        {/* Ringkasan */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Pemasukan</Text>
              <Text style={styles.summaryValueSuccess}>Rp {formatCurrency(totalIncome)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Biaya</Text>
              <Text style={styles.summaryValueDanger}>Rp {formatCurrency(totalExpenses)}</Text>
            </View>
          </View>
          <View style={styles.netRow}>
            <CheckCircleIcon size={16} color={colors.success} />
            <Text style={styles.netLabel}>Laba Bersih</Text>
            <Text style={styles.netValue}>Rp {formatCurrency(Math.max(netIncome, 0))}</Text>
          </View>
        </View>

        {/* Capaian target perl floor */}
        {summary.target_amount > 0 && (
          <View style={styles.targetSection}>
            <TargetWidget
              targetAmount={summary.target_amount}
              achieved={summary.net_income}
              progress={summary.target_progress}
              achievedText={summary.target_achieved ? 'Target tercapai' : 'Target belum tercapai'}
            />
          </View>
        )}

        {/* Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaksi</Text>
          {loading ? (
            <View style={styles.emptyBox}><Text style={styles.emptyText}>Memuat...</Text></View>
          ) : trips.length === 0 && expenses.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Belum ada transaksi</Text>
              <Text style={styles.emptyText}>Catat trip dan pengeluaran untuk melihat riwayat.</Text>
            </View>
          ) : (
            <>
              {trips.slice(0, 10).map((trip) => (
                <TripCard
                  key={`trip-${trip.id}`}
                  gross={trip.gross_income}
                  tip={trip.tip}
                  paymentType={trip.payment_type}
                  createdAt={trip.created_at}
                />
              ))}
              {expenses.slice(0, 10).map((expense) => (
                <ExpenseRow key={`exp-${expense.id}`} expense={expense} />
              ))}
            </>
          )}
        </View>

        {/* Export */}
        <TouchableOpacity style={styles.exportBtn} onPress={exportPdf} activeOpacity={0.85}>
          <DownloadIcon size={20} color={colors.white} />
          <Text style={styles.exportText}>Ekspor Laporan PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.copyBtn} onPress={() => {
          Alert.alert('Salin Ringkasan', generateSummaryText());
        }} activeOpacity={0.85}>
          <Text style={styles.copyText}>Salin Ringkasan Pembukuan</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ExpenseRow({ expense }: { expense: Expense }) {
  const labels: Record<string, string> = { fuel: 'Bensin', food: 'Makan', parking: 'Parkir', other: 'Lainnya' };
  return (
    <View style={styles.expenseRow}>
      <View style={styles.expenseLeft}>
        <View style={styles.expenseDot} />
        <Text style={styles.expenseName}>{labels[expense.category] || 'Biaya'}</Text>
      </View>
      <View style={styles.expenseRight}>
        <Text style={styles.expenseAmount}>-Rp {expense.amount.toLocaleString('id-ID')}</Text>
        <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>
      </View>
    </View>
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
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filterChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: 4,
  },
  summaryValueSuccess: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
  summaryValueDanger: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.danger,
  },
  netRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  netLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  netValue: {
    marginLeft: 'auto',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  targetSection: {
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
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
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  expenseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
  },
  expenseName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.danger,
  },
  expenseDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  exportBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  exportText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  copyBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  copyText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});