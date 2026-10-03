import api, { endpoints } from './api';
import { Trip, NewTrip, Expense, NewExpense, DailyTarget, NewTarget, Summary } from '../types';

export const tripService = {
  create: async (data: NewTrip): Promise<Trip> => {
    const res = await api.post(endpoints.trips, data);
    return res.data;
  },
  getByDate: async (date: string): Promise<Trip[]> => {
    const res = await api.get(`${endpoints.trips}?date=${date}`);
    return res.data;
  },
  getAll: async (): Promise<Trip[]> => {
    const res = await api.get(endpoints.trips);
    return res.data;
  },
};

export const expenseService = {
  create: async (data: NewExpense): Promise<Expense> => {
    const res = await api.post(endpoints.expenses, data);
    return res.data;
  },
  getByDate: async (date: string): Promise<Expense[]> => {
    const res = await api.get(`${endpoints.expenses}?date=${date}`);
    return res.data;
  },
  getAll: async (): Promise<Expense[]> => {
    const res = await api.get(endpoints.expenses);
    return res.data;
  },
};

export const targetService = {
  set: async (data: NewTarget): Promise<DailyTarget> => {
    const res = await api.post(endpoints.targets, data);
    return res.data;
  },
  getByDate: async (date: string): Promise<DailyTarget | null> => {
    const res = await api.get(`${endpoints.targets}?date=${date}`);
    return res.data;
  },
};

export const summaryService = {
  getByDate: async (date: string): Promise<Summary> => {
    const res = await api.get(`${endpoints.summary}?date=${date}`);
    return res.data;
  },
};