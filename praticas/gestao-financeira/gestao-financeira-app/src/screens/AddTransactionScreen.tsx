import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import CategoryPickerModal from '../components/CategoryPickerModal';
import * as api from '../services/api';
import { Category, RootStackParamList } from '../types';

type NavProp   = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'EditTransaction'>;

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

interface FieldProps {
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  children: React.ReactNode;
}

function Field({ label, icon, children }: FieldProps) {
  return (
    <View style={field.wrap}>
      <View style={field.labelRow}>
        <MaterialIcons name={icon} size={15} color="#5B5FEF" />
        <Text style={field.label}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

const field = StyleSheet.create({
  wrap:     { marginBottom: 16 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  label:    { fontSize: 13, fontWeight: '600', color: '#2D3436' },
});

export default function AddTransactionScreen() {
  const navigation = useNavigation<NavProp>();
  const route      = useRoute<RouteType>();
  const editing    = route.params?.transaction;

  const [description, setDesc]      = useState('');
  const [value, setValue]           = useState('');
  const [date, setDate]             = useState(todayStr());
  const [category, setCategory]     = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pickerVisible, setPicker]  = useState(false);
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (editing) {
      setDesc(editing.description);
      setValue(String(editing.value));
      setDate(editing.date);
      setCategory(editing.category ?? null);
    } else {
      setDesc(''); setValue(''); setDate(todayStr()); setCategory(null);
    }
  }, [editing]);

  const handleSubmit = async () => {
    if (!description.trim()) return Alert.alert('Atenção', 'Informe uma descrição.');
    const numVal = parseFloat(value.replace(',', '.'));
    if (isNaN(numVal) || numVal <= 0) return Alert.alert('Atenção', 'Informe um valor válido.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return Alert.alert('Atenção', 'Data: AAAA-MM-DD');
    if (!category) return Alert.alert('Atenção', 'Selecione uma categoria.');

    setSaving(true);
    try {
      const payload = { description: description.trim(), value: numVal, date, categoryId: category.id };
      if (editing) {
        await api.updateTransaction(editing.id, payload);
        navigation.navigate('MainTabs', { screen: 'Transações' });
      } else {
        await api.createTransaction(payload);
        Alert.alert('✓ Adicionado', `"${description.trim()}" registrado com sucesso!`);
        setDesc(''); setValue(''); setDate(todayStr()); setCategory(null);
      }
    } catch (e: any) {
      Alert.alert('Erro', e.response?.data?.error ?? 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={styles.header}>
          {editing && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
          )}
          <View style={styles.headerIcon}>
            <MaterialIcons name={editing ? 'edit' : 'add-circle-outline'} size={28} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>{editing ? 'Editar Transação' : 'Nova Transação'}</Text>
          <Text style={styles.headerSub}>
            {editing ? 'Altere os dados abaixo' : 'Registre uma receita ou despesa'}
          </Text>
        </View>

        <View style={styles.form}>
          <Field label="Descrição" icon="description">
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Ex: Aluguel, Supermercado…"
                placeholderTextColor="#b2bec3"
                value={description}
                onChangeText={setDesc}
              />
            </View>
          </Field>

          <Field label="Valor (R$)" icon="attach-money">
            <View style={styles.inputWrap}>
              <Text style={styles.currency}>R$</Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="0,00"
                placeholderTextColor="#b2bec3"
                value={value}
                onChangeText={setValue}
                keyboardType="decimal-pad"
              />
            </View>
          </Field>

          <Field label="Data" icon="event">
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="AAAA-MM-DD"
                placeholderTextColor="#b2bec3"
                value={date}
                onChangeText={setDate}
                maxLength={10}
              />
            </View>
          </Field>

          <Field label="Categoria" icon="category">
            <TouchableOpacity style={styles.categoryBtn} onPress={() => setPicker(true)}>
              {category ? (
                <View style={styles.categorySelected}>
                  <View style={[styles.catDot, { backgroundColor: category.background }]}>
                    <MaterialIcons name={(category.icon || 'category') as any} size={16} color="#fff" />
                  </View>
                  <Text style={styles.catName}>{category.displayName}</Text>
                  <View style={[styles.catType, { backgroundColor: category.isIncome ? '#E8FBF3' : '#FFF0ED' }]}>
                    <Text style={{ fontSize: 10, color: category.isIncome ? '#00B894' : '#E17055', fontWeight: '700' }}>
                      {category.isIncome ? 'Receita' : 'Despesa'}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.catPlaceholder}>
                  <MaterialIcons name="add-circle-outline" size={18} color="#b2bec3" />
                  <Text style={styles.catPlaceholderText}>Selecionar categoria</Text>
                </View>
              )}
              <MaterialIcons name="chevron-right" size={20} color="#b2bec3" />
            </TouchableOpacity>
          </Field>

          <TouchableOpacity
            style={[styles.submitBtn, saving && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name={editing ? 'save' : 'add-circle'} size={20} color="#fff" />
                <Text style={styles.submitText}>
                  {editing ? 'Salvar Alterações' : 'Adicionar Transação'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CategoryPickerModal
        visible={pickerVisible}
        categories={categories}
        selected={category}
        onSelect={setCategory}
        onClose={() => setPicker(false)}
        onCreated={(cat) => setCategories((prev) => [...prev, cat])}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#F5F6FA' },
  header:      { backgroundColor: '#5B5FEF', paddingTop: 54, paddingBottom: 28, paddingHorizontal: 24, alignItems: 'center' },
  backBtn:     { position: 'absolute', top: 54, left: 20, width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerIcon:  { width: 60, height: 60, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  form:        { margin: 16, backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 2, shadowColor: '#5B5FEF', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  inputWrap:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F6FA', borderRadius: 12, borderWidth: 1, borderColor: '#DFE6E9', paddingHorizontal: 14 },
  currency:    { fontSize: 15, fontWeight: '700', color: '#636E72', marginRight: 6 },
  input:       { paddingVertical: 14, fontSize: 15, color: '#2D3436', flex: 1 },
  categoryBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F6FA', borderRadius: 12, borderWidth: 1, borderColor: '#DFE6E9', paddingHorizontal: 14, paddingVertical: 12 },
  categorySelected: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  catDot:      { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  catName:     { flex: 1, fontSize: 15, color: '#2D3436', fontWeight: '600' },
  catType:     { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  catPlaceholder: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  catPlaceholderText: { fontSize: 15, color: '#b2bec3' },
  submitBtn:   { backgroundColor: '#5B5FEF', borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, elevation: 3, shadowColor: '#5B5FEF', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  submitText:  { color: '#fff', fontSize: 16, fontWeight: '700' },
});
