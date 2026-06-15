import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/constants/palette';
import { useAppData } from '@/contexts/app-data';
import { UniformItem } from '@/types/domain';

export default function ItemsScreen() {
  const { items, saveItem, deleteItem } = useAppData();
  const [newItemName, setNewItemName] = useState('');
  const [newRecoveryCost, setNewRecoveryCost] = useState('');

  async function handleAddItem() {
    if (!newItemName.trim()) return;
    const id = newItemName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (items.some(i => i.id === id)) {
      Alert.alert('Error', 'An item with this name already exists.');
      return;
    }
    const recoveryCost = parseFloat(newRecoveryCost) || 0;
    await saveItem({ id, name: newItemName.trim(), recoveryCost });
    setNewItemName('');
    setNewRecoveryCost('');
  }

  function confirmDelete(item: UniformItem) {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete ${item.name}? This will not remove transactions associated with this item name.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteItem(item.id) },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={21} color={palette.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Manage Items</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.addSection}>
        <View style={{ flex: 1, gap: 10 }}>
          <TextInput
            style={styles.input}
            placeholder="Item name (e.g. Shirt)"
            value={newItemName}
            onChangeText={setNewItemName}
          />
          <TextInput
            style={styles.input}
            placeholder="Recovery Cost (e.g. 250)"
            keyboardType="numeric"
            value={newRecoveryCost}
            onChangeText={setNewRecoveryCost}
          />
        </View>
        <Pressable style={styles.addButton} onPress={handleAddItem}>
          <Ionicons name="add" size={24} color={palette.white} />
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.itemIcon}>
              <Ionicons name="shirt-outline" size={20} color={palette.blue} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.id}>Cost: ₹{item.recoveryCost || 0}</Text>
            </View>
            <Pressable onPress={() => confirmDelete(item)}>
              <Ionicons name="trash-outline" size={20} color={palette.red} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No items defined yet.</Text>
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
  addSection: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20, marginTop: 10, alignItems: 'flex-end' },
  input: { height: 50, backgroundColor: palette.white, borderRadius: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: palette.border, color: palette.ink },
  addButton: { width: 50, height: 110, backgroundColor: palette.blue, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.white, borderRadius: 18, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: palette.border },
  itemIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EEF4FF', alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, marginLeft: 12 },
  name: { color: palette.ink, fontSize: 15, fontWeight: '700' },
  id: { color: palette.muted, fontSize: 11, marginTop: 2 },
  empty: { color: palette.muted, textAlign: 'center', marginTop: 50 },
});

