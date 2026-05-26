import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Pressable, Alert,
} from 'react-native';
import * as api from '../services/api';
import { Category } from '../types';

const PRESET_COLORS = ['#B5EAD7','#FFDAC1','#C7CEEA','#FF9AA2','#FFF5BA','#FFB6B6','#D4EDDA','#D1ECF1'];

interface Props {
  visible: boolean;
  categories: Category[];
  selected: Category | null;
  onSelect: (cat: Category) => void;
  onClose: () => void;
  onCreated: (cat: Category) => void;
}

export default function CategoryPickerModal({ visible, categories, selected, onSelect, onClose, onCreated }: Props) {
  const [creating, setCreating]   = useState(false);
  const [name, setName]           = useState('');
  const [displayName, setDisplay] = useState('');
  const [icon, setIcon]           = useState('');
  const [bg, setBg]               = useState(PRESET_COLORS[0]);
  const [isIncome, setIsIncome]   = useState(false);
  const [saving, setSaving]       = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !displayName.trim() || !icon.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    setSaving(true);
    try {
      const cat = await api.createCategory({
        name: name.trim(), displayName: displayName.trim(),
        icon: icon.trim(), background: bg, isIncome,
      });
      onCreated(cat);
      setCreating(false);
      setName(''); setDisplay(''); setIcon('');
      onSelect(cat);
    } catch (e: any) {
      Alert.alert('Erro', e.response?.data?.error ?? 'Não foi possível criar a categoria.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet}>
          {!creating ? (
            <>
              <Text style={styles.title}>Selecionar Categoria</Text>
              <FlatList
                data={categories}
                keyExtractor={(c) => c.id}
                style={{ maxHeight: 320 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.row, selected?.id === item.id && styles.rowSelected]}
                    onPress={() => { onSelect(item); onClose(); }}
                  >
                    <View style={[styles.dot, { backgroundColor: item.background }]} />
                    <Text style={styles.rowText}>{item.displayName}</Text>
                    {item.isIncome && <Text style={styles.incomeTag}>Receita</Text>}
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.addBtn} onPress={() => setCreating(true)}>
                <Text style={styles.addBtnText}>+ Nova Categoria</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Nova Categoria</Text>
              <TextInput style={styles.input} placeholder="Nome interno (ex: health)" value={name} onChangeText={setName} autoCapitalize="none" />
              <TextInput style={styles.input} placeholder="Nome exibido (ex: Saúde)" value={displayName} onChangeText={setDisplay} />
              <TextInput style={styles.input} placeholder="Ícone (ex: favorite)" value={icon} onChangeText={setIcon} autoCapitalize="none" />

              <Text style={styles.label}>Cor de fundo</Text>
              <View style={styles.colorRow}>
                {PRESET_COLORS.map((c) => (
                  <TouchableOpacity key={c} onPress={() => setBg(c)} style={[styles.colorDot, { backgroundColor: c }, bg === c && styles.colorDotSelected]} />
                ))}
              </View>

              <TouchableOpacity style={styles.typeToggle} onPress={() => setIsIncome(!isIncome)}>
                <Text style={styles.typeToggleText}>{isIncome ? 'Tipo: Receita' : 'Tipo: Despesa'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.addBtn, saving && { opacity: 0.6 }]} onPress={handleCreate} disabled={saving}>
                <Text style={styles.addBtnText}>{saving ? 'Salvando…' : 'Criar Categoria'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCreating(false)} style={{ marginTop: 8 }}>
                <Text style={{ color: '#636E72', textAlign: 'center' }}>Voltar</Text>
              </TouchableOpacity>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet:    { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  title:    { fontSize: 17, fontWeight: '700', color: '#2D3436', marginBottom: 14 },
  row:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  rowSelected: { backgroundColor: '#EEF0FF', borderRadius: 8 },
  rowText:  { flex: 1, fontSize: 15, color: '#2D3436' },
  incomeTag:{ fontSize: 11, color: '#27AE60', backgroundColor: '#E8F8F0', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  dot:      { width: 16, height: 16, borderRadius: 8, marginRight: 12 },
  addBtn:   { backgroundColor: '#5B5FEF', borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 14 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  input:    { borderWidth: 1, borderColor: '#DFE6E9', borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 14 },
  label:    { fontSize: 13, color: '#636E72', marginBottom: 6 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  colorDot: { width: 30, height: 30, borderRadius: 15 },
  colorDotSelected: { borderWidth: 3, borderColor: '#5B5FEF' },
  typeToggle:     { backgroundColor: '#F0F0F0', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginBottom: 6 },
  typeToggleText: { fontWeight: '600', color: '#2D3436' },
});
