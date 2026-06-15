import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { distributionHistory } from '@/data/sample-data';
import { palette } from '@/constants/palette';
import { useAppData } from '@/contexts/app-data';

export default function EmployeeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { employees } = useAppData();
  const employee = employees.find((item) => item.id === id);

  if (!employee) return <SafeAreaView style={styles.safeArea}><Text>Employee not found.</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}><Ionicons name="arrow-back" size={21} color={palette.ink} /></Pressable>
        <Text style={styles.headerTitle}>Employee details</Text>
        <Pressable><Ionicons name="create-outline" size={22} color={palette.blue} /></Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profile}>
          <View style={styles.avatar}><Text style={styles.initials}>{employee.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</Text></View>
          <Text style={styles.name}>{employee.name}</Text>
          <Text style={styles.code}>{employee.code}</Text>
          <View style={styles.unitBadge}><Ionicons name="business-outline" size={14} color={palette.blue} /><Text style={styles.unitText}>{employee.unitName}</Text></View>
        </View>
        <Text style={styles.sectionTitle}>Information</Text>
        <View style={styles.card}>
          <Info label="Father's name" value={employee.fatherName} />
          <Info label="Joining date" value={employee.joiningDate} />
          <Info label="Employment status" value={employee.status === 'active' ? 'Active' : 'Inactive'} last />
        </View>
        <Text style={styles.sectionTitle}>2026 uniform summary</Text>
        <View style={styles.card}>
          {distributionHistory.map((record, index) => (
            <View key={record.itemName} style={[styles.historyRow, index === distributionHistory.length - 1 && styles.lastRow]}>
              <View style={styles.itemIcon}><Ionicons name="shirt-outline" size={19} color={palette.blue} /></View>
              <View style={styles.historyCopy}><Text style={styles.itemName}>{record.itemName}</Text><Text style={styles.itemMeta}>Allowed {record.allowed}</Text></View>
              <Text style={[styles.issued, record.issued > record.allowed && styles.over]}>Issued {record.issued}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Info({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return <View style={[styles.info, last && styles.lastRow]}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.background },
  header: { height: 62, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 38, height: 38, borderRadius: 12, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: palette.ink, fontSize: 16, fontWeight: '800' },
  content: { paddingHorizontal: 20, paddingBottom: 36 },
  profile: { alignItems: 'center', paddingVertical: 16 },
  avatar: { width: 72, height: 72, borderRadius: 24, backgroundColor: '#E8F0FF', alignItems: 'center', justifyContent: 'center' },
  initials: { color: palette.blue, fontSize: 22, fontWeight: '800' },
  name: { color: palette.ink, fontSize: 21, fontWeight: '800', marginTop: 12 },
  code: { color: palette.muted, fontSize: 13, marginTop: 4 },
  unitBadge: { marginTop: 10, flexDirection: 'row', gap: 6, backgroundColor: '#EEF4FF', borderRadius: 20, paddingHorizontal: 11, paddingVertical: 6 },
  unitText: { color: palette.blue, fontSize: 12, fontWeight: '700' },
  sectionTitle: { color: palette.ink, fontSize: 16, fontWeight: '800', marginTop: 20, marginBottom: 10 },
  card: { backgroundColor: palette.white, borderRadius: 18, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 15 },
  info: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.border, flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { color: palette.muted, fontSize: 13 },
  infoValue: { color: palette.ink, fontSize: 13, fontWeight: '700' },
  historyRow: { minHeight: 66, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.border },
  lastRow: { borderBottomWidth: 0 },
  itemIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#EEF4FF', alignItems: 'center', justifyContent: 'center' },
  historyCopy: { flex: 1, marginLeft: 11 },
  itemName: { color: palette.ink, fontSize: 14, fontWeight: '700' },
  itemMeta: { color: palette.muted, fontSize: 11, marginTop: 3 },
  issued: { color: palette.green, fontSize: 12, fontWeight: '800' },
  over: { color: palette.red },
});
