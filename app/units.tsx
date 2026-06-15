import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/constants/palette';
import { useAppData } from '@/contexts/app-data';
import { Unit } from '@/types/domain';

export default function UnitsScreen() {
  const { units, saveUnit, deleteUnit } = useAppData();
  const [newUnitName, setNewUnitName] = useState('');

  async function handleAddUnit() {
    if (!newUnitName.trim()) return;
    const id = newUnitName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (units.some(u => u.id === id)) {
      Alert.alert('Error', 'A unit with this name already exists.');
      return;
    }
    await saveUnit({ id, name: newUnitName.trim() });
    setNewUnitName('');
  }

  function confirmDelete(unit: Unit) {
    Alert.alert(
      'Delete Unit',
      `Are you sure you want to delete ${unit.name}? This will not remove employees or transactions associated with this unit name.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteUnit(unit.id) },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={21} color={palette.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Manage Units</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.addSection}>
        <TextInput
          style={styles.input}
          placeholder="New unit name (e.g. Reliance)"
          value={newUnitName}
          onChangeText={setNewUnitName}
        />
        <Pressable style={styles.addButton} onPress={handleAddUnit}>
          <Ionicons name="add" size={24} color={palette.white} />
        </Pressable>
      </View>

      <FlatList
        data={units}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.unitIcon}>
              <Ionicons name="business-outline" size={20} color={palette.blue} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.id}>ID: {item.id}</Text>
            </View>
            <Pressable onPress={() => confirmDelete(item)}>
              <Ionicons name="trash-outline" size={20} color={palette.red} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No units defined yet.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.background },
  header: { height: 62, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 38, height: 38, borderRadius: 12, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: palette.ink, fontSize: 17, fontWeight: '800' },
  headerSpacer: { width: 38 },
  addSection: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20, marginTop: 10 },
  input: { flex: 1, height: 50, backgroundColor: palette.white, borderRadius: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: palette.border, color: palette.ink },
  addButton: { width: 50, height: 50, backgroundColor: palette.blue, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.white, borderRadius: 18, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: palette.border },
  unitIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EEF4FF', alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, marginLeft: 12 },
  name: { color: palette.ink, fontSize: 15, fontWeight: '700' },
  id: { color: palette.muted, fontSize: 11, marginTop: 2 },
  empty: { color: palette.muted, textAlign: 'center', marginTop: 50 },
});
