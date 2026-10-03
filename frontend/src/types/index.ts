// Data types for MitraRoda
import { getToday } from '../constants';

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Trip {
  id: number;
  driver_id: number;
  gross_income: number;
  tip: number;
  payment_type: 'cash' | 'non-cash';
  date: string;
  created_at: string;
}

export interface Expense {
  id: number;
  driver_id: number;
  category: 'fuel' | 'food' | 'parking' | 'other';
  amount: number;
  date: string;
  description?: string;
  created_at: string;
}

export interface DailyTarget {
  id: number;
  driver_id: number;
  target_amount: number;
  date: string;
}

export interface Summary {
  date: string;
  total_gross: number;
  total_tips: number;
  total_income: number;
  total_expenses: number;
  net_income: number;
  target_amount: number;
  target_achieved: boolean;
  target_progress: number;
  expense_breakdown: { category: string; total: number }[];
  payment_breakdown: { payment_type: string; total: number }[];
}

export const emptySummary: Summary = {
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

export interface NewTrip {
  gross_income: number;
  tip: number;
  payment_type: 'cash' | 'non-cash';
  date: string;
}

export interface NewExpense {
  category: 'fuel' | 'food' | 'parking' | 'other';
  amount: number;
  date: string;
  description?: string;
}

export interface NewTarget {
  target_amount: number;
  date: string;
}