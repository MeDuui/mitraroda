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
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight, getToday, formatCurrency } from '../constants';
import { PlusIcon } from './Icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (gross: number, tip: number, paymentType: 'cash' | 'non-cash') => void;
  submitting?: boolean;
}

export default function AddTripModal({ visible, onClose, onSubmit, submitting }: Props) {
  const [gross, setGross] = useState('');
  const [tip, setTip] = useState('');
  const [paymentType, setPaymentType] = useState<'cash' | 'non-cash'>('cash');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const g = Number(gross.replace(/[^\d]/g, ''));
    const t = Number(tip.replace(/[^\d]/g, ''));
    if (!g || g <= 0) {
      setError('Nominal argo tidak boleh kosong');
      return;
    }
    onSubmit(g, t || 0, paymentType);
    setGross('');
    setTip('');
    setPaymentType('cash');
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
          <View style={styles.header}>
            <Text style={styles.title}>Catat Trip Baru</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.field}>
              <Text style={styles.label}>Nominal Argo</Text>
              <TextInput
                style={styles.input}
                placeholder="Rp 0"
                placeholderTextColor={colors.textMuted}
                value={gross}
                onChangeText={(t) => {
                  setGross(t);
                  setError('');
                }}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Tip (opsional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Rp 0"
                placeholderTextColor={colors.textMuted}
                value={tip}
                onChangeText={setTip}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Jenis Pembayaran</Text>
              <View style={styles.segmentRow}>
                {(['cash', 'non-cash'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.segment, paymentType === type && styles.segmentActive]}
                    onPress={() => setPaymentType(type)}
                  >
                    <Text style={[styles.segmentText, paymentType === type && styles.segmentTextActive]}>
                      {type === 'cash' ? 'Tunai' : 'Non-Tunai'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

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
                <>
                  <PlusIcon size={20} color={colors.white} />
                  <Text style={styles.submitText}>Catat Trip</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: fontWeight.semibold,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
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
  },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmentText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
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