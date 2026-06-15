import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/constants/palette';
import { useAppData } from '@/contexts/app-data';

export default function MonthlyReportScreen() {
  const { distributionRecords } = useAppData();

  const grouped = useMemo(() => {
    const map = new Map<string, { month: string, count: number, quantity: number }>();
    distributionRecords.forEach(r => {
      const date = new Date(`${r.issuedAt}T00:00:00`);
      const key = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      const current = map.get(key) || { month: key, count: 0, quantity: 0 };
      current.count += 1;
      current.quantity += r.quantity;
      map.set(key, current);
    });
    return Array.from(map.values()).sort((a, b) => {
        // Sort by date descending
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateB.getTime() - dateA.getTime();
    });
  }, [distributionRecords]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={21} color={palette.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Monthly Summary</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={grouped}
        keyExtractor={(item) => item.month}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.monthIcon}>
              <Ionicons name="calendar-outline" size={22} color={palette.blue} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.month}>{item.month}</Text>
              <Text style={styles.meta}>{item.count} distribution records</Text>
            </View>
            <View style={styles.qtyBadge}>
              <Text style={styles.qtyText}>{item.quantity} units</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No distribution data available.</Text>
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
  list: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.white, borderRadius: 18, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: palette.border },
  monthIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF4FF', alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, marginLeft: 14 },
  month: { color: palette.ink, fontSize: 15, fontWeight: '700' },
  meta: { color: palette.muted, fontSize: 12, marginTop: 3 },
  qtyBadge: { backgroundColor: '#E6F7EF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  qtyText: { color: palette.green, fontSize: 12, fontWeight: '800' },
  empty: { color: palette.muted, textAlign: 'center', marginTop: 50 },
});
