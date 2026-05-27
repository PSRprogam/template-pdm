import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, FlatList, Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

interface Props {
  month: number;
  year: number;
  availableMonths?: string[];
  onChange: (month: number, year: number) => void;
}

export default function MonthYearFilter({ month, year, availableMonths = [], onChange }: Props) {
  const [open, setOpen] = useState(false);

  const currentKey  = `${year}-${String(month).padStart(2, '0')}`;
  const displayName = `${MONTHS[month - 1]} ${year}`;

  const handleSelect = (key: string) => {
    const [y, m] = key.split('-');
    onChange(Number(m), Number(y));
    setOpen(false);
  };

  const formatKey = (key: string) => {
    const [y, m] = key.split('-');
    return `${MONTHS[Number(m) - 1]} ${y}`;
  };

  return (
    <>
      <TouchableOpacity style={styles.pill} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <MaterialIcons name="calendar-today" size={15} color="#5B5FEF" />
        <Text style={styles.pillText}>{displayName}</Text>
        <MaterialIcons name="expand-more" size={18} color="#5B5FEF" />
      </TouchableOpacity>

      <Modal transparent animationType="slide" visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Selecionar período</Text>

            <FlatList
              data={availableMonths.length > 0 ? availableMonths : [currentKey]}
              keyExtractor={(k) => k}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => {
                const selected = item === currentKey;
                return (
                  <TouchableOpacity
                    style={[styles.item, selected && styles.itemSelected]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={[styles.itemText, selected && styles.itemTextSelected]}>
                      {formatKey(item)}
                    </Text>
                    {selected && <MaterialIcons name="check-circle" size={20} color="#5B5FEF" />}
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(false)}>
              <Text style={styles.closeBtnText}>Fechar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 6,
    backgroundColor: '#EEF0FF', borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: 8, marginVertical: 10,
  },
  pillText: { fontSize: 15, fontWeight: '700', color: '#5B5FEF' },
  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet:    { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  handle:      { width: 40, height: 4, backgroundColor: '#DFE6E9', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetTitle:  { fontSize: 16, fontWeight: '800', color: '#2D3436', marginBottom: 12 },
  item:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4 },
  itemSelected:    { backgroundColor: '#EEF0FF' },
  itemText:        { fontSize: 15, color: '#636E72', fontWeight: '500' },
  itemTextSelected:{ color: '#5B5FEF', fontWeight: '700' },
  closeBtn:     { backgroundColor: '#F5F6FA', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  closeBtnText: { fontSize: 15, fontWeight: '600', color: '#636E72' },
});
