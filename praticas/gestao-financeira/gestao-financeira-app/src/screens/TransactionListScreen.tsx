import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, Alert,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import MonthYearFilter from '../components/MonthYearFilter';
import TransactionCard from '../components/TransactionCard';
import EditDeleteModal from '../components/EditDeleteModal';
import * as api from '../services/api';
import { Transaction, RootStackParamList } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const fmt = (v: number) =>
  `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

export default function TransactionListScreen() {
  const { user, signOut }           = useAuth();
  const navigation                   = useNavigation<NavProp>();
  const now                          = new Date();
  const [month, setMonth]            = useState(now.getMonth() + 1);
  const [year, setYear]              = useState(now.getFullYear());
  const [transactions, setTxs]       = useState<Transaction[]>([]);
  const [availableMonths, setMonths] = useState<string[]>([]);
  const [loading, setLoading]        = useState(true);
  const [refreshing, setRefreshing]  = useState(false);
  const [selected, setSelected]      = useState<Transaction | null>(null);
  const [modalVisible, setModal]     = useState(false);

  const load = useCallback(async (m: number, y: number) => {
    try {
      const [data, months] = await Promise.all([
        api.getTransactions(m, y),
        api.getAvailableMonths(),
      ]);
      setTxs(data);
      setMonths(months);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar as transações.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load(month, year);
    }, [month, year, load]),
  );

  const handleFilterChange = (m: number, y: number) => {
    setMonth(m); setYear(y);
    setLoading(true);
    load(m, y);
  };

  const handleOptions = (item: Transaction) => { setSelected(item); setModal(true); };

  const handleEdit = () => {
    setModal(false);
    if (selected) navigation.navigate('EditTransaction', { transaction: selected });
  };

  const handleDelete = async () => {
    const id = selected?.id;
    setModal(false);
    try {
      if (id) await api.deleteTransaction(id);
      setTxs((prev) => prev.filter((t) => t.id !== id));
    } catch {
      Alert.alert('Erro', 'Não foi possível excluir a transação.');
    }
  };

  const totalIncome  = transactions.filter((t) =>  t.category?.isIncome).reduce((s, t) => s + t.value, 0);
  const totalExpense = transactions.filter((t) => !t.category?.isIncome).reduce((s, t) => s + t.value, 0);
  const balance      = totalIncome - totalExpense;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.name}! 👋</Text>
          <Text style={styles.headerSub}>Acompanhe suas finanças</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <MaterialIcons name="logout" size={20} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: '#00B894' }]}>
          <MaterialIcons name="trending-up" size={18} color="rgba(255,255,255,0.8)" />
          <Text style={styles.summaryLabel}>Receitas</Text>
          <Text style={styles.summaryValue}>{fmt(totalIncome)}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#E17055' }]}>
          <MaterialIcons name="trending-down" size={18} color="rgba(255,255,255,0.8)" />
          <Text style={styles.summaryLabel}>Despesas</Text>
          <Text style={styles.summaryValue}>{fmt(totalExpense)}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: balance >= 0 ? '#5B5FEF' : '#E17055' }]}>
          <MaterialIcons name="account-balance" size={18} color="rgba(255,255,255,0.8)" />
          <Text style={styles.summaryLabel}>Saldo</Text>
          <Text style={styles.summaryValue}>{fmt(balance)}</Text>
        </View>
      </View>

      <MonthYearFilter month={month} year={year} availableMonths={availableMonths} onChange={handleFilterChange} />

      <Text style={styles.listTitle}>
        Transações {transactions.length > 0 ? `(${transactions.length})` : ''}
      </Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#5B5FEF" size="large" />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => (
            <TransactionCard item={item} onOptions={handleOptions} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(month, year); }}
              colors={['#5B5FEF']}
              tintColor="#5B5FEF"
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name="receipt-long" size={40} color="#b2bec3" />
              </View>
              <Text style={styles.emptyTitle}>Nenhuma transação</Text>
              <Text style={styles.emptyText}>
                Toque em <Text style={{ fontWeight: '700', color: '#5B5FEF' }}>Adicionar</Text> para registrar uma movimentação.
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <EditDeleteModal
        visible={modalVisible}
        transaction={selected}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onClose={() => setModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F5F6FA' },
  header:       { backgroundColor: '#5B5FEF', paddingTop: 54, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting:     { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerSub:    { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  logoutBtn:    { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  summaryRow:   { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginTop: -1, marginBottom: 4 },
  summaryCard:  { flex: 1, borderRadius: 16, padding: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  summaryLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  summaryValue: { fontSize: 13, fontWeight: '800', color: '#fff', marginTop: 2 },
  listTitle:    { fontSize: 13, fontWeight: '700', color: '#636E72', marginHorizontal: 20, marginBottom: 4 },
  empty:        { alignItems: 'center', marginTop: 60, paddingHorizontal: 32 },
  emptyIcon:    { width: 80, height: 80, borderRadius: 24, backgroundColor: '#F0F2F5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle:   { fontSize: 17, fontWeight: '700', color: '#2D3436', marginBottom: 6 },
  emptyText:    { fontSize: 13, color: '#636E72', textAlign: 'center', lineHeight: 20 },
});
