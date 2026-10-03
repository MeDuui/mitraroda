import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, spacing, borderRadius, fontSize, fontWeight, getToday, emptySummary } from '../../src/constants';
import { tripService, expenseService, targetService, summaryService } from '../../src/services/dataService';
import TargetWidget from '../../src/components/TargetWidget';
import TripCard from '../../src/components/TripCard';
import AddTripModal from '../../src/components/AddTripModal';
import AddExpenseModal from '../../src/components/AddExpenseModal';
import { WalletIcon, PlusIcon, BookIcon, LogoutIcon } from '../../src/components/Icons';
import { Summary, Trip } from '../../src/types';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const date = getToday();
      const [summaryData, trips] = await Promise.all([
        summaryService.getByDate(date),
        tripService.getByDate(date),
      ]);
      setSummary(summaryData);
      setRecentTrips(trips);
    } catch (err) {
      console.error('Failed to load home data:', err);
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

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddTrip = async (gross: number, tip: number, paymentType: 'cash' | 'non-cash') => {
    setSubmitting(true);
    try {
      await tripService.create({ gross_income: gross, tip, payment_type: paymentType, date: getToday() });
      setShowTripModal(false);
      await loadData();
    } catch (err) {
      Alert.alert('Gagal', 'Tidak dapat menyimpan trip. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddExpense = async (category: 'fuel' | 'food' | 'parking' | 'other', amount: number) => {
    setSubmitting(true);
    try {
      await expenseService.create({ category, amount, date: getToday() });
      setShowExpenseModal(false);
      await loadData();
    } catch (err) {
      Alert.alert('Gagal', 'Tidak dapat menyimpan pengeluaran. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Keluar', 'Yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo, {user?.username || 'Driver'}</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogoutIcon size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        {/* Saldo bersih hari ini */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceLabelRow}>
            <WalletIcon size={18} color={colors.white} />
            <Text style={styles.balanceLabel}>Laba Bersih Hari Ini</Text>
          </View>
          <Text style={styles.balanceValue}>
            Rp {loading ? '...' : (summary.net_income).toLocaleString('id-ID')}
          </Text>
          <View style={styles.balanceMeta}>
            <Text style={styles.balanceMetaText}>
              Pemasukan Rp {(summary.total_income).toLocaleString('id-ID')}
            </Text>
            <Text style={styles.balanceMetaText}> - </Text>
            <Text style={styles.balanceMetaText}>
              Biaya Rp {(summary.total_expenses).toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        {/* Target harian */}
        <View style={styles.section}>
          <TargetWidget
            targetAmount={summary.target_amount}
            achieved={summary.net_income}
            progress={summary.target_progress}
            achievedText={
              summary.target_amount > 0
                ? summary.target_achieved
                  ? 'Target hari ini tercapai'
                  : `Tinggal Rp ${Math.max(summary.target_amount - summary.net_income, 0).toLocaleString('id-ID')} lagi`
                : 'Belum ada target'
            }
          />
        </View>

        {/* Aksi cepat */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionPrimary]}
            onPress={() => setShowTripModal(true)}
            activeOpacity={0.85}
          >
            <PlusIcon size={22} color={colors.white} />
            <Text style={styles.actionPrimaryText}>Catat Trip Baru</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionSecondary]}
            onPress={() => setShowExpenseModal(true)}
            activeOpacity={0.85}
          >
            <BookIcon size={20} color={colors.primary} />
            <Text style={styles.actionSecondaryText}>Catat Biaya</Text>
          </TouchableOpacity>
        </View>

        {/* Trip terbaru */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trip Hari Ini</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
              <Text style={styles.sectionLink}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Memuat...</Text>
            </View>
          ) : recentTrips.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Belum ada trip</Text>
              <Text style={styles.emptyText}>Tekan "Catat Trip Baru" untuk mulai mencatat pendapatan hari ini.</Text>
            </View>
          ) : (
            recentTrips.slice(0, 5).map((trip) => (
              <TripCard
                key={trip.id}
                gross={trip.gross_income}
                tip={trip.tip}
                paymentType={trip.payment_type}
                createdAt={trip.created_at}
              />
            ))
          )}
        </View>
      </ScrollView>

      <AddTripModal
        visible={showTripModal}
        onClose={() => setShowTripModal(false)}
        onSubmit={handleAddTrip}
        submitting={submitting}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  greeting: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  balanceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  balanceLabel: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    opacity: 0.9,
  },
  balanceValue: {
    color: colors.white,
    fontSize: 34,
    fontWeight: fontWeight.bold,
    letterSpacing: -1,
  },
  balanceMeta: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  balanceMetaText: {
    color: '#fff',
    fontSize: fontSize.xs,
    opacity: 0.85,
  },
  section: {
    marginBottom: spacing.lg,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  actionPrimary: {
    backgroundColor: colors.primary,
  },
  actionSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionPrimaryText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  actionSecondaryText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  sectionLink: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
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
});