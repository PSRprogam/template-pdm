import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, Transaction, User } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANTE: troque pelo IP local da sua máquina antes de testar no celular.
//
// Como descobrir seu IP:
//   Windows → abra o terminal e execute: ipconfig
//             procure "Endereço IPv4" (ex.: 192.168.0.5)
//
// Exemplos:
//   Celular físico na mesma rede Wi-Fi → 'http://192.168.0.5:3000'
//   Emulador Android (AVD)             → 'http://10.0.2.2:3000'
//   Expo Go no celular                 → 'http://SEU_IP_LOCAL:3000'
// ─────────────────────────────────────────────────────────────────────────────
const BASE_URL = 'http://192.168.0.46:3000'; // IP Wi-Fi da máquina

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@fin:token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ────────────────────────────────────────────────────────────────────
export const login = (email: string, password: string): Promise<{ user: User; token: string }> =>
  api.post('/auth/login', { email, password }).then((r) => r.data);

// ─── Categories ──────────────────────────────────────────────────────────────
export const getCategories = (): Promise<Category[]> =>
  api.get('/categories').then((r) => r.data);

export const createCategory = (data: Omit<Category, 'id' | 'isDefault'>): Promise<Category> =>
  api.post('/categories', data).then((r) => r.data);

export const updateCategory = (id: string, data: Partial<Category>): Promise<Category> =>
  api.put(`/categories/${id}`, data).then((r) => r.data);

export const deleteCategory = (id: string): Promise<void> =>
  api.delete(`/categories/${id}`);

// ─── Transactions ─────────────────────────────────────────────────────────────
export const getAvailableMonths = (): Promise<string[]> =>
  api.get('/transactions/months').then((r) => r.data);

export const getTransactions = (month?: number, year?: number): Promise<Transaction[]> => {
  const params: Record<string, number> = {};
  if (month) params.month = month;
  if (year)  params.year  = year;
  return api.get('/transactions', { params }).then((r) => r.data);
};

export const createTransaction = (data: Omit<Transaction, 'id' | 'category'>): Promise<Transaction> =>
  api.post('/transactions', data).then((r) => r.data);

export const updateTransaction = (id: string, data: Partial<Omit<Transaction, 'id' | 'category'>>): Promise<Transaction> =>
  api.put(`/transactions/${id}`, data).then((r) => r.data);

export const deleteTransaction = (id: string): Promise<void> =>
  api.delete(`/transactions/${id}`);
