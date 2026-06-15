import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/constants/palette';

const reportTypes = [
  { title: 'Monthly Summary', icon: 'calendar-outline', subtitle: 'View distributions by month', route: '/reports/monthly' as const },
  { title: 'Pending Excess', icon: 'alert-circle-outline', subtitle: 'Unresolved excess cases', route: '/reports/pending' as const },
  { title: 'Deduction History', icon: 'receipt-outline', subtitle: 'List of all recoveries', route: '/reports/deductions' as const },
  { title: 'Employee History', icon: 'person-outline', subtitle: 'Individual issue history', route: '/employees' as const }, // Redirect to employee search
  { title: 'Unit Summary', icon: 'business-outline', subtitle: 'Entitlement usage by unit', route: '/reports/units' as const },
];

export default function ReportsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={21} color={palette.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Analytics & Reports</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {reportTypes.map((report, index) => (
            <Pressable
              key={report.title}
              style={[styles.row, index < reportTypes.length - 1 && styles.divider]}
              onPress={() => router.push(report.route)}
            >
              <View style={styles.icon}><Ionicons name={report.icon as any} size={22} color={palette.blue} /></View>
              <View style={styles.copy}>
                <Text style={styles.title}>{report.title}</Text>
                <Text style={styles.subtitle}>{report.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={palette.muted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.background },
  header: { height: 62, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 38, height: 38, borderRadius: 12, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: palette.ink, fontSize: 17, fontWeight: '800' },
  headerSpacer: { width: 38 },
  content: { padding: 20 },
  card: { backgroundColor: palette.white, borderRadius: 18, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 14 },
  row: { minHeight: 70, flexDirection: 'row', alignItems: 'center' },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.border },
  icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EEF4FF', alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, marginLeft: 12 },
  title: { color: palette.ink, fontSize: 14, fontWeight: '700' },
  subtitle: { color: palette.muted, fontSize: 11, marginTop: 3 },
});
