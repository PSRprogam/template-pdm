import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import MonthYearFilter from '../components/MonthYearFilter';
import * as api from '../services/api';
import { Transaction } from '../types';

const CHART_SIZE = 180;

const fmt = (v: number) =>
  `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

interface PieSlice {
  name: string;
  value: number;
  color: string;
}

interface PieSliceWithPath extends PieSlice {
  d: string;
}

function PieChart({ data }: { data: PieSlice[] }) {
  const size  = CHART_SIZE;
  const cx    = size / 2;
  const cy    = size / 2;
  const r     = size / 2 - 4;
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0 || data.length === 0) return null;

  if (data.length === 1) {
    return (
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={r} fill={data[0].color} />
      </Svg>
    );
  }

  const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);
  const ptOn  = (angle: number) => ({
    x: cx + r * Math.cos(toRad(angle)),
    y: cy + r * Math.sin(toRad(angle)),
  });

  let cursor = 0;
  const slices: PieSliceWithPath[] = data.map((item) => {
    const sweep = (item.value / total) * 360;
    const start = cursor;
    cursor += sweep;
    const s     = ptOn(start);
    const e     = ptOn(Math.min(cursor, start + sweep));
    const large = sweep > 180 ? 1 : 0;
    const d     = `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
    return { ...item, d };
  });

  return (
    <Svg width={size} height={size}>
      {slices.map((s, i) => (
        <Path key={i} d={s.d} fill={s.color} stroke="#fff" strokeWidth={2} />
      ))}
    </Svg>
  );
}

export default function SummaryScreen() {
  const now                          = new Date();
  const [month, setMonth]            = useState(now.getMonth() + 1);
  const [year, setYear]              = useState(now.getFullYear());
  const [transactions, setTxs]       = useState<Transaction[]>([]);
  const [availableMonths, setMonths] = useState<string[]>([]);
  const [loading, setLoading]        = useState(true);

  const load = useCallback(async (m: number, y: number) => {
    setLoading(true);
    try {
      const [data, months] = await Promise.all([
        api.getTransactions(m, y),
        api.getAvailableMonths(),
      ]);
      setTxs(data);
      setMonths(months);
    } catch {
      setTxs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => { load(month, year); }, [month, year, load]),
  );

  const handleFilterChange = (m: number, y: number) => { setMonth(m); setYear(y); };

  const income   = transactions.filter((t) =>  t.category?.isIncome);
  const expenses = transactions.filter((t) => !t.category?.isIncome);

  const totalIncome  = income.reduce((s, t) => s + t.value, 0);
  const totalExpense = expenses.reduce((s, t) => s + t.value, 0);
  const balance      = totalIncome - totalExpense;

  const COLORS = ['#5B5FEF','#FF6B6B','#FFA94D','#51CF66','#339AF0','#CC5DE8','#74C0FC','#63E6BE','#FFD43B'];

  const expenseByCategory = expenses.reduce<Record<string, { value: number; color: string }>>((acc, t) => {
    const name  = t.category?.displayName ?? 'Outros';
    const color = t.category?.background  ?? '#ccc';
    if (!acc[name]) acc[name] = { value: 0, color };
    acc[name].value += t.value;
    return acc;
  }, {});

  const pieData: PieSlice[] = Object.entries(expenseByCategory).map(([name, { value, color }], i) => ({
    name,
    value,
    color: color !== '#ccc' ? color : COLORS[i % COLORS.length],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resumo</Text>
      </View>

      <MonthYearFilter month={month} year={year} availableMonths={availableMonths} onChange={handleFilterChange} />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#5B5FEF" size="large" />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>

          <View style={styles.totalsRow}>
            <View style={[styles.totalCard, { borderLeftColor: '#27AE60' }]}>
              <Text style={styles.totalLabel}>Receitas</Text>
              <Text style={[styles.totalValue, { color: '#27AE60' }]}>{fmt(totalIncome)}</Text>
            </View>
            <View style={[styles.totalCard, { borderLeftColor: '#E74C3C' }]}>
              <Text style={styles.totalLabel}>Despesas</Text>
              <Text style={[styles.totalValue, { color: '#E74C3C' }]}>{fmt(totalExpense)}</Text>
            </View>
          </View>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo do período</Text>
            <Text style={[styles.balanceValue, { color: balance >= 0 ? '#27AE60' : '#E74C3C' }]}>
              {balance >= 0 ? '+' : ''}{fmt(balance)}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Despesas por Categoria</Text>
            {pieData.length === 0 ? (
              <View style={styles.emptyChart}>
                <Text style={styles.emptyIcon}>🥧</Text>
                <Text style={styles.emptyText}>Nenhuma despesa neste período.</Text>
              </View>
            ) : (
              <View>
                <View style={styles.chartCenter}>
                  <PieChart data={pieData} />
                </View>
                <View style={styles.legend}>
                  {pieData.map((item) => {
                    const pct = Math.round((item.value / totalExpense) * 100);
                    return (
                      <View key={item.name} style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                        <Text style={styles.legendName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.legendPct}>{pct}%</Text>
                        <Text style={styles.legendValue}>{fmt(item.value)}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {pieData.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Proporção</Text>
              {[...pieData].sort((a, b) => b.value - a.value).map((item) => (
                <View key={item.name} style={{ marginBottom: 10 }}>
                  <View style={styles.barHeader}>
                    <Text style={styles.barLabel}>{item.name}</Text>
                    <Text style={styles.barValue}>{fmt(item.value)}</Text>
                  </View>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, {
                      width: `${Math.round((item.value / totalExpense) * 100)}%` as `${number}%`,
                      backgroundColor: item.color,
                    }]} />
                  </View>
                </View>
              ))}
            </View>
          )}

          {income.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Receitas</Text>
              {income.map((t) => (
                <View key={t.id} style={styles.incomeRow}>
                  <Text style={styles.incomeDesc}>{t.description}</Text>
                  <Text style={styles.incomeVal}>{fmt(t.value)}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header:       { backgroundColor: '#5B5FEF', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle:  { fontSize: 22, fontWeight: '800', color: '#fff' },
  totalsRow:    { flexDirection: 'row', margin: 16, gap: 12 },
  totalCard:    { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  totalLabel:   { fontSize: 12, color: '#636E72' },
  totalValue:   { fontSize: 16, fontWeight: '700', marginTop: 4 },
  balanceCard:  { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  balanceLabel: { fontSize: 13, color: '#636E72' },
  balanceValue: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  section:      { margin: 16, backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#2D3436', marginBottom: 12 },
  emptyChart:   { alignItems: 'center', paddingVertical: 32 },
  emptyIcon:    { fontSize: 40, marginBottom: 10 },
  emptyText:    { color: '#636E72', fontSize: 14 },
  chartCenter:  { alignItems: 'center', marginVertical: 16 },
  legend:       { marginTop: 8, borderTopWidth: 1, borderTopColor: '#F5F6FA', paddingTop: 12 },
  legendRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  legendDot:    { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  legendName:   { flex: 1, fontSize: 13, color: '#2D3436', fontWeight: '500' },
  legendPct:    { fontSize: 12, fontWeight: '700', color: '#636E72', marginRight: 10, width: 36, textAlign: 'right' },
  legendValue:  { fontSize: 12, fontWeight: '700', color: '#2D3436', width: 90, textAlign: 'right' },
  barHeader:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barLabel:     { fontSize: 12, color: '#2D3436' },
  barValue:     { fontSize: 12, fontWeight: '600', color: '#2D3436' },
  barBg:        { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
  barFill:      { height: 8, borderRadius: 4 },
  incomeRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  incomeDesc:   { fontSize: 14, color: '#2D3436', flex: 1 },
  incomeVal:    { fontSize: 14, fontWeight: '700', color: '#27AE60' },
});
