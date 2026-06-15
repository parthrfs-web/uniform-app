import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/constants/palette';
import { useAppData } from '@/contexts/app-data';
import { UnitPolicy, Unit, UniformItem } from '@/types/domain';

export default function PoliciesScreen() {
  const { policies, units, items, savePolicy, deletePolicy } = useAppData();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedItem, setSelectedItem] = useState<UniformItem | null>(null);
  const [limit, setLimit] = useState('');

  const [picking, setPicking] = useState<'unit' | 'item' | null>(null);

  async function handleSavePolicy() {
    if (!selectedUnit || !selectedItem || !limit.trim()) {
      Alert.alert('Error', 'Please select unit, item and enter a limit.');
      return;
    }
    const annualLimit = parseInt(limit, 10);
    if (isNaN(annualLimit) || annualLimit < 0) {
      Alert.alert('Error', 'Please enter a valid non-negative number for limit.');
      return;
    }

    await savePolicy({
      unitName: selectedUnit.name,
      itemName: selectedItem.name,
      annualLimit,
    });
    
    setModalVisible(false);
    setSelectedUnit(null);
    setSelectedItem(null);
    setLimit('');
  }

  function confirmDelete(policy: UnitPolicy) {
    Alert.alert(
      'Delete Policy',
      `Are you sure you want to delete the policy for ${policy.itemName} in ${policy.unitName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deletePolicy(policy.unitName, policy.itemName) },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={21} color={palette.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Entitlement Policies</Text>
        <Pressable style={styles.plus} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color={palette.blue} />
        </Pressable>
      </View>

      <FlatList
        data={policies}
        keyExtractor={(item) => `${item.unitName}-${item.itemName}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.copy}>
              <Text style={styles.unitName}>{item.unitName}</Text>
              <Text style={styles.itemName}>{item.itemName}</Text>
            </View>
            <View style={styles.limitBadge}>
              <Text style={styles.limitText}>Limit: {item.annualLimit}</Text>
            </View>
            <Pressable onPress={() => confirmDelete(item)}>
              <Ionicons name="trash-outline" size={20} color={palette.red} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No policies defined yet.</Text>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Policy</Text>
            
            <Text style={styles.label}>Select Unit</Text>
            <Pressable style={styles.picker} onPress={() => setPicking('unit')}>
              <Text style={[styles.pickerText, !selectedUnit && styles.placeholder]}>
                {selectedUnit ? selectedUnit.name : 'Choose a unit...'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={palette.muted} />
            </Pressable>

            <Text style={styles.label}>Select Item</Text>
            <Pressable style={styles.picker} onPress={() => setPicking('item')}>
              <Text style={[styles.pickerText, !selectedItem && styles.placeholder]}>
                {selectedItem ? selectedItem.name : 'Choose an item...'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={palette.muted} />
            </Pressable>

            <Text style={styles.label}>Annual Limit</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 2"
              keyboardType="number-pad"
              value={limit}
              onChangeText={setLimit}
            />

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.saveButton]} onPress={handleSavePolicy}>
                <Text style={styles.saveText}>Save Policy</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {picking && (
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContent}>
              <Text style={styles.pickerTitle}>Select {picking === 'unit' ? 'Unit' : 'Item'}</Text>
              <FlatList
                data={picking === 'unit' ? units : items}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.pickerItem}
                    onPress={() => {
                      if (picking === 'unit') setSelectedUnit(item as Unit);
                      else setSelectedItem(item as UniformItem);
                      setPicking(null);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{item.name}</Text>
                  </Pressable>
                )}
              />
              <Pressable style={styles.closePicker} onPress={() => setPicking(null)}>
                <Text style={styles.closePickerText}>Close</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.background },
  header: { height: 62, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 38, height: 38, borderRadius: 12, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: palette.ink, fontSize: 17, fontWeight: '800' },
  plus: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.white, borderRadius: 18, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: palette.border },
  copy: { flex: 1 },
  unitName: { color: palette.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  itemName: { color: palette.ink, fontSize: 15, fontWeight: '700', marginTop: 2 },
  limitBadge: { backgroundColor: '#EAF2FF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, marginRight: 15 },
  limitText: { color: palette.blue, fontSize: 12, fontWeight: '800' },
  empty: { color: palette.muted, textAlign: 'center', marginTop: 50 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: palette.white, borderRadius: 24, padding: 24 },
  modalTitle: { color: palette.ink, fontSize: 20, fontWeight: '800', marginBottom: 20 },
  label: { color: palette.ink, fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 12 },
  picker: { height: 50, backgroundColor: '#F8F9FB', borderRadius: 12, borderWidth: 1, borderColor: palette.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
  pickerText: { color: palette.ink, fontSize: 14 },
  placeholder: { color: palette.muted },
  modalInput: { height: 50, backgroundColor: '#F8F9FB', borderRadius: 12, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 15, color: palette.ink },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 30 },
  modalButton: { flex: 1, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  cancelButton: { backgroundColor: '#F2F3F5' },
  cancelText: { color: palette.ink, fontWeight: '700' },
  saveButton: { backgroundColor: palette.blue },
  saveText: { color: palette.white, fontWeight: '700' },
  pickerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 40 },
  pickerContent: { backgroundColor: palette.white, borderRadius: 20, padding: 20, maxHeight: '80%' },
  pickerTitle: { fontSize: 18, fontWeight: '800', marginBottom: 15, textAlign: 'center' },
  pickerItem: { paddingVertical: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.border },
  pickerItemText: { fontSize: 16, color: palette.ink, textAlign: 'center' },
  closePicker: { marginTop: 15, padding: 10 },
  closePickerText: { color: palette.blue, fontWeight: '700', textAlign: 'center' },
});
