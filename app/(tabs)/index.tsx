import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { palette } from '@/constants/palette';
import { useAppData } from '@/contexts/app-data';

const quickActions = [
  { label: 'Import Excel', icon: 'cloud-upload-outline', route: '/import' as const },
  { label: 'Find Employee', icon: 'search-outline', route: '/employees' as const },
  { label: 'Review Excess', icon: 'alert-circle-outline', route: '/review' as const },
  { label: 'Reports', icon: 'document-text-outline', route: '/more' as const },
];

export default function DashboardScreen() {
  const { employees, excessCases, units, items, recoveries, importHistory } = useAppData();

  const totalRecoveries = useMemo(() => recoveries.reduce((sum, r) => sum + r.amount, 0), [recoveries]);
  const recentItems = useMemo(() => importHistory.slice(0, 3), [importHistory]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        eyebrow={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        title="Operations dashboard"
        action={<Ionicons name="notifications-outline" size={23} color={palette.ink} />}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="shirt-outline" size={27} color={palette.white} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroLabel}>Pending attention</Text>
            <Text style={styles.heroValue}>{excessCases.length} excess cases</Text>
            <Text style={styles.heroMeta}>Across {new Set(excessCases.map(c => c.unitName)).size} client units</Text>
          </View>
          <Pressable style={styles.heroButton} onPress={() => router.push('/review')}>
            <Ionicons name="arrow-forward" size={20} color={palette.navy} />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard icon="people-outline" value={employees.length} label="Employees" tone="blue" />
          <StatCard icon="business-outline" value={units.length} label="Units" tone="purple" />
          <StatCard icon="wallet-outline" value={`₹${totalRecoveries.toLocaleString('en-IN')}`} label="Recoveries" tone="green" />
          <StatCard icon="cube-outline" value={items.length} label="Uniform items" tone="orange" />
        </View>

        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.actions}>
          {quickActions.map((action) => (
            <Pressable key={action.label} style={styles.action} onPress={() => router.push(action.route)}>
              <View style={styles.actionIcon}>
                <Ionicons name={action.icon as keyof typeof Ionicons.glyphMap} size={22} color={palette.blue} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Ionicons name="chevron-forward" size={17} color={palette.muted} />
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recent imports</Text>
          <Text style={styles.link} onPress={() => router.push('/import-history')}>View all</Text>
        </View>
        <View style={styles.listCard}>
          {recentItems.length === 0 ? (
            <Text style={{ padding: 20, textAlign: 'center', color: palette.muted }}>No recent imports.</Text>
          ) : (
            recentItems.map((item, index) => (
              <View key={item.id} style={[styles.importRow, index < recentItems.length - 1 && styles.divider]}>
                <View style={styles.fileIcon}>
                  <Ionicons name="document-outline" size={20} color={palette.green} />
                </View>
                <View style={styles.importCopy}>
                  <Text style={styles.importName} numberOfLines={1}>{item.fileName}</Text>
                  <Text style={styles.importMeta}>{item.records} records · {item.importedAt}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color={palette.green} />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


function StatCard({ icon, value, label, tone }: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  tone: 'blue' | 'purple' | 'green' | 'orange';
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, styles[`${tone}Tone`]]}>
        <Ionicons name={icon} size={21} color={styles[`${tone}Text`].color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, paddingBottom: 36 },
  hero: { backgroundColor: palette.navy, borderRadius: 22, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 26 },
  heroIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)' },
  heroCopy: { flex: 1, marginLeft: 14 },
  heroLabel: { color: '#AFC0D9', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.7 },
  heroValue: { color: palette.white, fontSize: 21, fontWeight: '800', marginTop: 3 },
  heroMeta: { color: '#AFC0D9', fontSize: 13, marginTop: 3 },
  heroButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: palette.white, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { color: palette.ink, fontSize: 17, fontWeight: '800', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 26 },
  statCard: { width: '48%', flexGrow: 1, backgroundColor: palette.white, padding: 15, borderRadius: 18, borderWidth: 1, borderColor: palette.border },
  statIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  blueTone: { backgroundColor: '#EAF2FF' }, blueText: { color: palette.blue },
  purpleTone: { backgroundColor: '#F1ECFF' }, purpleText: { color: '#7557C9' },
  greenTone: { backgroundColor: '#E6F7EF' }, greenText: { color: palette.green },
  orangeTone: { backgroundColor: '#FFF1E2' }, orangeText: { color: '#D77718' },
  statValue: { color: palette.ink, fontSize: 22, fontWeight: '800' },
  statLabel: { color: palette.muted, fontSize: 13, marginTop: 3 },
  actions: { backgroundColor: palette.white, borderRadius: 18, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 14, marginBottom: 26 },
  action: { minHeight: 61, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.border },
  actionIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#EEF4FF', alignItems: 'center', justifyContent: 'center' },
  actionLabel: { flex: 1, color: palette.ink, fontSize: 14, fontWeight: '700', marginLeft: 12 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { color: palette.blue, fontWeight: '700', fontSize: 13, marginBottom: 12 },
  listCard: { backgroundColor: palette.white, borderRadius: 18, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 14 },
  importRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.border },
  fileIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#EAF8F1', alignItems: 'center', justifyContent: 'center' },
  importCopy: { flex: 1, marginHorizontal: 11 },
  importName: { color: palette.ink, fontSize: 14, fontWeight: '700' },
  importMeta: { color: palette.muted, fontSize: 12, marginTop: 3 },
});
