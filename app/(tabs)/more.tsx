import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { palette } from '@/constants/palette';

const sections = [
  {
    title: 'Data',
    items: [
      { icon: 'cloud-upload-outline', title: 'Excel imports', subtitle: 'Monthly and historical bulk import', route: '/import' as const },
      { icon: 'business-outline', title: 'Units', subtitle: 'Manage client and unit records', route: '/units' as const },
      { icon: 'shirt-outline', title: 'Uniform items', subtitle: 'Items, variants and recovery costs', route: '/items' as const },
      { icon: 'options-outline', title: 'Entitlement policies', subtitle: 'Annual unit-wise limits', route: '/policies' as const },
    ],
  },
  {
    title: 'Operations',
    items: [
      { icon: 'bar-chart-outline', title: 'Reports', subtitle: 'Deductions, pending and unit summaries', route: '/reports' as const },
      { icon: 'receipt-outline', title: 'Recovery records', subtitle: 'Audit deductions and waivers', route: '/recoveries' as const },
      { icon: 'settings-outline', title: 'Settings', subtitle: 'Application and company preferences', route: '/settings' as const },
    ],
  },
] as const;

export default function MoreScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Manage" eyebrow="Administration and reports" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {sections.map((section) => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, index) => (
                <Pressable
                  key={item.title}
                  style={[styles.row, index < section.items.length - 1 && styles.divider]}
                  onPress={() => router.push(item.route as any)}>
                  <View style={styles.icon}><Ionicons name={item.icon as any} size={21} color={palette.blue} /></View>
                  <View style={styles.copy}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={palette.muted} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.background },
  content: { paddingHorizontal: 20, paddingBottom: 36 },
  sectionTitle: { color: palette.muted, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 9, marginTop: 4 },
  card: { backgroundColor: palette.white, borderRadius: 18, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 14, marginBottom: 24 },
  row: { minHeight: 70, flexDirection: 'row', alignItems: 'center' },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.border },
  icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EEF4FF', alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, marginLeft: 12 },
  title: { color: palette.ink, fontSize: 14, fontWeight: '700' },
  subtitle: { color: palette.muted, fontSize: 11, marginTop: 3 },
});
