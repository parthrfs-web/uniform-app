import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/constants/palette';
import { useAppData } from '@/contexts/app-data';

import { exportToExcel } from '@/services/excel-export';

export default function DeductionReportScreen() {
  const { recoveries } = useAppData();

  async function handleExport() {
    await exportToExcel(recoveries, `Recoveries_${new Date().toISOString().split('T')[0]}`);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={21} color={palette.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Deduction History</Text>
        <Pressable onPress={handleExport}>
          <Ionicons name="download-outline" size={22} color={palette.blue} />
        </Pressable>
      </View>

      <FlatList
        data={recoveries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.receiptIcon}>
              <Ionicons name="receipt-outline" size={22} color={palette.green} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.name}>{item.employeeCode} · {item.itemName}</Text>
              <Text style={styles.meta}>{item.quantity} units · {item.date}</Text>
            </View>
            <View style={styles.amountBadge}>
              <Text style={styles.amountText}>₹{item.amount}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No recovery records found.</Text>
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
  receiptIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#E6F7EF', alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, marginLeft: 14 },
  name: { color: palette.ink, fontSize: 14, fontWeight: '700' },
  meta: { color: palette.muted, fontSize: 11, marginTop: 3 },
  amountBadge: { backgroundColor: '#F8F9FB', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  amountText: { color: palette.ink, fontSize: 13, fontWeight: '800' },
  empty: { color: palette.muted, textAlign: 'center', marginTop: 50 },
});
