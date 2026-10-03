// Design Tokens - MitraRoda Driver Velocity
export const colors = {
  primary: '#f97316',
  primaryDark: '#ea580c',
  primaryLight: '#fb923c',
  
  background: '#faf8ff',
  surface: '#ffffff',
  surfaceAlt: '#f2f3ff',
  
  textPrimary: '#1e293b',
  textSecondary: '#475569',
  textMuted: '#64748b',
  
  success: '#10b981',
  successLight: '#d1fae5',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  warning: '#f59e0b',
  
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  
  white: '#ffffff',
  black: '#0f172a',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
};

export const paymentTypes = {
  cash: { label: 'Tunai', color: colors.success },
  'non-cash': { label: 'Non-Tunai', color: colors.primary },
};

export const expenseCategories = {
  fuel: { label: 'Bensin', icon: 'gas', color: '#3b82f6' },
  food: { label: 'Makan', icon: 'food', color: '#f59e0b' },
  parking: { label: 'Parkir', icon: 'parking', color: '#8b5cf6' },
  other: { label: 'Lainnya', icon: 'more', color: '#6b7280' },
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
};

export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const emptySummary = {
  date: getToday(),
  total_gross: 0,
  total_tips: 0,
  total_income: 0,
  total_expenses: 0,
  net_income: 0,
  target_amount: 0,
  target_achieved: false,
  target_progress: 0,
  expense_breakdown: [],
  payment_breakdown: [],
};