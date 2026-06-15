import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/constants/palette';
import { useAppData } from '@/contexts/app-data';
import { exportToExcel } from '@/services/excel-export';

export default function UnitReportScreen() {
  const { employees, distributionRecords, units } = useAppData();

  const unitStats = useMemo(() => {
    const map = new Map<string, { name: string, employees: number, issues: number }>();
    
    // Initialize with all defined units
    units.forEach(u => map.set(u.name.toLowerCase(), { name: u.name, employees: 0, issues: 0 }));

    employees.forEach(e => {
      const unitKey = e.unitName.toLowerCase();
      const current = map.get(unitKey) || { name: e.unitName, employees: 0, issues: 0 };
      current.employees += 1;
      map.set(unitKey, current);
    });

    const employeeToUnit = new Map(employees.map(e => [e.code.toLowerCase(), e.unitName.toLowerCase()]));

    distributionRecords.forEach(r => {
      const unitKey = employeeToUnit.get(r.employeeCode.toLowerCase());
      if (unitKey) {
        const current = map.get(unitKey)!;
        current.issues += r.quantity;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.issues - a.issues);
  }, [employees, distributionRecords, units]);

  async function handleExport() {
    await exportToExcel(unitStats, `Unit_Summary_${new Date().toISOString().split('T')[0]}`);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={21} color={palette.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Unit Usage Summary</Text>
        <Pressable onPress={handleExport}>
          <Ionicons name="download-outline" size={22} color={palette.blue} />
        </Pressable>
      </View>

      <FlatList
        data={unitStats}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.unitIcon}>
              <Ionicons name="business-outline" size={22} color={palette.blue} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.employees} active employees</Text>
            </View>
            <View style={styles.qtyBadge}>
              <Text style={styles.qtyText}>{item.issues} issued</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No unit data available.</Text>
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
  list: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.white, borderRadius: 18, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: palette.border },
  unitIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F1ECFF', alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, marginLeft: 14 },
  name: { color: palette.ink, fontSize: 15, fontWeight: '700' },
  meta: { color: palette.muted, fontSize: 12, marginTop: 3 },
  qtyBadge: { backgroundColor: '#EAF2FF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  qtyText: { color: palette.blue, fontSize: 12, fontWeight: '800' },
  empty: { color: palette.muted, textAlign: 'center', marginTop: 50 },
});
