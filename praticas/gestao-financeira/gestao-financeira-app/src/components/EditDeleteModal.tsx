import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Transaction } from '../types';

const fmt = (v: number) =>
  `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

interface Props {
  visible: boolean;
  transaction: Transaction | null;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function EditDeleteModal({ visible, transaction, onEdit, onDelete, onClose }: Props) {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (visible) setConfirming(false);
  }, [visible]);

  if (!transaction) return null;
  const isIncome = transaction.category?.isIncome;

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>

          <View style={styles.handle} />

          <View style={styles.txRow}>
            <View style={[styles.txIcon, { backgroundColor: transaction.category?.background ?? '#eee' }]}>
              <MaterialIcons name={(transaction.category?.icon ?? 'category') as any} size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.txDesc} numberOfLines={1}>{transaction.description}</Text>
              <Text style={styles.txCat}>{transaction.category?.displayName}</Text>
            </View>
            <Text style={[styles.txVal, { color: isIncome ? '#00B894' : '#E17055' }]}>
              {isIncome ? '+' : '-'}{fmt(transaction.value)}
            </Text>
          </View>

          <View style={styles.divider} />

          {!confirming ? (
            <>
              <TouchableOpacity style={styles.action} onPress={onEdit}>
                <View style={styles.actionIcon}>
                  <MaterialIcons name="edit" size={20} color="#5B5FEF" />
                </View>
                <Text style={styles.actionLabel}>Editar transação</Text>
                <MaterialIcons name="chevron-right" size={20} color="#b2bec3" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.action} onPress={() => setConfirming(true)}>
                <View style={[styles.actionIcon, { backgroundColor: '#FFF0F0' }]}>
                  <MaterialIcons name="delete-outline" size={20} color="#E17055" />
                </View>
                <Text style={[styles.actionLabel, { color: '#E17055' }]}>Excluir transação</Text>
                <MaterialIcons name="chevron-right" size={20} color="#b2bec3" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.confirmBox}>
                <View style={styles.confirmIconWrap}>
                  <MaterialIcons name="delete-forever" size={32} color="#E17055" />
                </View>
                <Text style={styles.confirmTitle}>Excluir transação?</Text>
                <Text style={styles.confirmText}>
                  Esta ação não pode ser desfeita.{'\n'}
                  <Text style={{ fontWeight: '700', color: '#2D3436' }}>
                    "{transaction.description}"
                  </Text>{' '}
                  será removida permanentemente.
                </Text>
              </View>

              <TouchableOpacity style={styles.deleteConfirmBtn} onPress={onDelete}>
                <MaterialIcons name="delete-forever" size={18} color="#fff" />
                <Text style={styles.deleteConfirmText}>Sim, excluir</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirming(false)}>
                <Text style={styles.cancelText}>Voltar</Text>
              </TouchableOpacity>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:    { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  handle:   { width: 40, height: 4, backgroundColor: '#DFE6E9', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  txRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  txIcon:   { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  txDesc:   { fontSize: 15, fontWeight: '700', color: '#2D3436' },
  txCat:    { fontSize: 12, color: '#636E72', marginTop: 2 },
  txVal:    { fontSize: 16, fontWeight: '800' },
  divider:  { height: 1, backgroundColor: '#F5F6FA', marginBottom: 12 },
  action:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  actionIcon:   { width: 38, height: 38, borderRadius: 12, backgroundColor: '#EEF0FF', alignItems: 'center', justifyContent: 'center' },
  actionLabel:  { flex: 1, fontSize: 15, fontWeight: '600', color: '#2D3436' },
  cancelBtn:    { backgroundColor: '#F5F6FA', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  cancelText:   { fontSize: 15, fontWeight: '600', color: '#636E72' },
  confirmBox:       { alignItems: 'center', paddingVertical: 16 },
  confirmIconWrap:  { width: 64, height: 64, borderRadius: 20, backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  confirmTitle:     { fontSize: 18, fontWeight: '800', color: '#2D3436', marginBottom: 8 },
  confirmText:      { fontSize: 14, color: '#636E72', textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  deleteConfirmBtn: {
    backgroundColor: '#E17055', borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4,
  },
  deleteConfirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
