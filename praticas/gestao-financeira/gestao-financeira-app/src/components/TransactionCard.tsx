import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Transaction } from '../types';

const fmt = (v: number) =>
  `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

const formatDate = (d: string) => {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

const SAFE_ICONS: Record<string, React.ComponentProps<typeof MaterialIcons>['name']> = {
  'attach-money':   'attach-money',
  'restaurant':     'restaurant',
  'directions-car': 'directions-car',
  'sports-esports': 'sports-esports',
  'receipt':        'receipt',
  'favorite':       'favorite',
};

interface Props {
  item: Transaction;
  onOptions: (item: Transaction) => void;
}

export default function TransactionCard({ item, onOptions }: Props) {
  const isIncome = item.category?.isIncome;
  const iconName = SAFE_ICONS[item.category?.icon ?? ''] ?? 'category';
  const bgColor  = item.category?.background ?? '#E8E8E8';

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: bgColor }]}>
        <MaterialIcons name={iconName} size={22} color="#fff" />
      </View>

      <View style={styles.info}>
        <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
        <View style={styles.metaRow}>
          <View style={[styles.catBadge, { backgroundColor: bgColor + '33' }]}>
            <Text style={[styles.catText, { color: isIncome ? '#00B894' : '#E17055' }]}>
              {item.category?.displayName ?? '—'}
            </Text>
          </View>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.value, { color: isIncome ? '#00B894' : '#E17055' }]}>
          {isIncome ? '+' : '-'}{fmt(item.value)}
        </Text>
        <TouchableOpacity
          onPress={() => onOptions(item)}
          style={styles.optBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="more-vert" size={20} color="#b2bec3" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 16,
    padding: 14, marginHorizontal: 16, marginVertical: 5,
    elevation: 2, shadowColor: '#5B5FEF', shadowOpacity: 0.07,
    shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  iconWrap:    { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  info:        { flex: 1, marginRight: 8 },
  description: { fontSize: 15, fontWeight: '600', color: '#2D3436', marginBottom: 5 },
  metaRow:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  catBadge:    { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  catText:     { fontSize: 11, fontWeight: '600' },
  date:        { fontSize: 11, color: '#b2bec3' },
  right:       { alignItems: 'flex-end', gap: 4 },
  value:       { fontSize: 15, fontWeight: '800' },
  optBtn:      { padding: 2 },
});
