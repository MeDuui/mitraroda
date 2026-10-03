import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../constants';
import { GasIcon, FoodIcon, ParkingIcon, MoreIcon } from './Icons';

const CATEGORIES: { key: 'fuel' | 'food' | 'parking' | 'other'; icon: any; label: string; color: string }[] = [
  { key: 'fuel', icon: GasIcon, label: 'Bensin', color: '#3b82f6' },
  { key: 'food', icon: FoodIcon, label: 'Makan', color: '#f59e0b' },
  { key: 'parking', icon: ParkingIcon, label: 'Parkir', color: '#8b5cf6' },
  { key: 'other', icon: MoreIcon, label: 'Lainnya', color: '#6b7280' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (category: 'fuel' | 'food' | 'parking' | 'other', amount: number) => void;
  submitting?: boolean;
}

export default function AddExpenseModal({ visible, onClose, onSubmit, submitting }: Props) {
  const [category, setCategory] = useState<'fuel' | 'food' | 'parking' | 'other'>('fuel');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const a = Number(amount.replace(/[^\d]/g, ''));
    if (!a || a <= 0) {
      setError('Nominal wajib diisi');
      return;
    }
    onSubmit(category, a);
    setAmount('');
    setError('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Catat Pengeluaran</Text>

          <Text style={styles.label}>Kategori</Text>
          <View style={styles.jenisRow}>
            {CATEGORIES.map(({ key, icon: Icon, label, color }) => (
              <TouchableOpacity
                key={key}
                style={[styles.jenisItem, category === key && styles.jenisItemActive]}
                onPress={() => setCategory(key)}
              >
                <Icon size={22} color={category === key ? colors.primary : color} />
                <Text style={[styles.jenisLabel, category === key && styles.jenisLabelActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Nominal</Text>
          <TextInput
            style={styles.input}
            placeholder="Rp 0"
            placeholderTextColor={colors.textMuted}
            value={amount}
            onChangeText={(t) => {
              setAmount(t);
              setError('');
            }}
            keyboardType="number-pad"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitText}>Catat Pengeluaran</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15,23,42,0.5)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  jenisRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  jenisItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  jenisItemActive: {
    borderColor: colors.primary,
    backgroundColor: '#fff7ed',
  },
  jenisLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  jenisLabelActive: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
    marginTop: 4,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});