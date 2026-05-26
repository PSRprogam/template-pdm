import { NavigatorScreenParams } from '@react-navigation/native';

export interface Category {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  background: string;
  isIncome: boolean;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  description: string;
  value: number;
  date: string;
  categoryId: string;
  category?: Category;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export type TabParamList = {
  'Transações': undefined;
  'Adicionar': undefined;
  'Resumo': undefined;
};

export type RootStackParamList = {
  Login: undefined;
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  EditTransaction: { transaction: Transaction };
};
