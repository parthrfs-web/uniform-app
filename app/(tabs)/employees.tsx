import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { palette } from '@/constants/palette';
import { useAppData } from '@/contexts/app-data';

export default function EmployeesScreen() {
  const { employees } = useAppData();
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return employees.filter((employee) =>
      !search || employee.name.toLowerCase().includes(search) || employee.code.toLowerCase().includes(search)
    );
  }, [employees, query]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Employees" eyebrow={`${employees.length} employee records`} />
      <View style={styles.search}>
        <Ionicons name="search-outline" size={20} color={palette.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search name or employee code"
          placeholderTextColor={palette.muted}
          style={styles.input}
          autoCapitalize="none"
        />
        {!!query && (
          <Pressable onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={19} color={palette.muted} />
          </Pressable>
        )}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>No employee matches “{query}”.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/employee/${item.id}`)}>
            <View style={styles.avatar}><Text style={styles.initials}>{initials(item.name)}</Text></View>
            <View style={styles.copy}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.code}>{item.code} · {item.unitName}</Text>
            </View>
            <View style={[styles.badge, item.status === 'inactive' && styles.inactiveBadge]}>
              <Text style={[styles.badgeText, item.status === 'inactive' && styles.inactiveText]}>{item.status}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={palette.muted} />
          </Pressable>
        )}
      />
      <Pressable style={styles.fab}>
        <Ionicons name="add" size={27} color={palette.white} />
      </Pressable>
    </SafeAreaView>
  );
}

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.background },
  search: { marginHorizontal: 20, marginBottom: 10, height: 50, borderRadius: 15, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: palette.white, borderWidth: 1, borderColor: palette.border },
  input: { flex: 1, color: palette.ink, fontSize: 14, marginHorizontal: 10 },
  list: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 100 },
  card: { backgroundColor: palette.white, borderRadius: 16, borderWidth: 1, borderColor: palette.border, padding: 13, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#E8F0FF', alignItems: 'center', justifyContent: 'center' },
  initials: { color: palette.blue, fontWeight: '800', fontSize: 14 },
  copy: { flex: 1, marginLeft: 12 },
  name: { color: palette.ink, fontSize: 15, fontWeight: '700' },
  code: { color: palette.muted, fontSize: 12, marginTop: 4 },
  badge: { borderRadius: 20, backgroundColor: '#E6F7EF', paddingHorizontal: 8, paddingVertical: 4, marginRight: 6 },
  inactiveBadge: { backgroundColor: '#F2F3F5' },
  badgeText: { color: palette.green, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  inactiveText: { color: palette.muted },
  empty: { color: palette.muted, textAlign: 'center', marginTop: 50 },
  fab: { position: 'absolute', right: 22, bottom: 22, width: 56, height: 56, borderRadius: 18, backgroundColor: palette.blue, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: palette.navy, shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
});
