import { Ionicons } from '@expo/vector-icons';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { palette } from '@/constants/palette';
import { useAppData } from '@/contexts/app-data';

export default function ReviewScreen() {
  const { excessCases: cases, resolveExcess } = useAppData();

  async function resolve(item: any, action: 'Deduct' | 'Waive') {
    Alert.prompt(
      `Confirm ${action}`,
      `How many ${item.itemName} do you want to ${action.toLowerCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          onPress: async (qty?: string) => {
            const num = parseInt(qty || '0', 10);
            if (isNaN(num) || num <= 0) {
              Alert.alert('Invalid quantity', 'Please enter a positive number.');
              return;
            }
            await resolveExcess(item.id, action.toLowerCase() as 'deduct' | 'waive', num);
            Alert.alert(`${action} recorded`, `${num} item(s) have been ${action.toLowerCase()}ed.`);
          },
        },
      ],
      'plain-text',
      item.pendingQuantity.toString()
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Excess review" eyebrow={`${cases.length} unresolved cases`} />
      <FlatList
        data={cases}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle-outline" size={52} color={palette.green} />
            <Text style={styles.emptyTitle}>Review queue cleared</Text>
            <Text style={styles.emptyCopy}>There are no unresolved excess uniforms.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.topRow}>
              <View style={styles.avatar}><Text style={styles.initials}>{item.employeeName[0]}</Text></View>
              <View style={styles.copy}>
                <Text style={styles.name}>{item.employeeName}</Text>
                <Text style={styles.meta}>{item.employeeCode} · {item.unitName}</Text>
              </View>
              <View style={styles.excessBadge}><Text style={styles.excessText}>+{item.pendingQuantity}</Text></View>
            </View>
            <View style={styles.itemRow}>
              <View>
                <Text style={styles.itemName}>{item.itemName}</Text>
                <Text style={styles.year}>Exceeded in {item.triggerMonth ?? item.year}</Text>
              </View>
              <View style={styles.numbers}>
                <Metric label="Allowed" value={item.allowedQuantity} />
                <Metric label="Issued" value={item.issuedQuantity} />
                <Metric label="Pending" value={item.pendingQuantity} danger />
              </View>
            </View>
            <View style={styles.actions}>
              <Pressable style={[styles.button, styles.holdButton]} onPress={() => Alert.alert('Case held', 'It will remain in future reviews.')}>
                <Text style={styles.holdText}>Hold</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.waiveButton]} onPress={() => resolve(item, 'Waive')}>
                <Text style={styles.waiveText}>Waive</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.deductButton]} onPress={() => resolve(item, 'Deduct')}>
                <Text style={styles.deductText}>Deduct</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}


function Metric({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return <View style={styles.metric}><Text style={[styles.metricValue, danger && styles.danger]}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.background },
  list: { paddingHorizontal: 20, paddingBottom: 36 },
  card: { backgroundColor: palette.white, borderRadius: 19, borderWidth: 1, borderColor: palette.border, padding: 16, marginBottom: 13 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#E8F0FF', alignItems: 'center', justifyContent: 'center' },
  initials: { color: palette.blue, fontWeight: '800' },
  copy: { flex: 1, marginLeft: 11 },
  name: { color: palette.ink, fontSize: 15, fontWeight: '800' },
  meta: { color: palette.muted, fontSize: 12, marginTop: 3 },
  excessBadge: { backgroundColor: '#FFF0EE', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  excessText: { color: palette.red, fontSize: 14, fontWeight: '900' },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: palette.border },
  itemName: { color: palette.ink, fontSize: 15, fontWeight: '700' },
  year: { color: palette.muted, fontSize: 11, marginTop: 3 },
  numbers: { flexDirection: 'row', gap: 15 },
  metric: { alignItems: 'center' },
  metricValue: { color: palette.ink, fontSize: 16, fontWeight: '800' },
  metricLabel: { color: palette.muted, fontSize: 10, marginTop: 2 },
  danger: { color: palette.red },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  button: { flex: 1, height: 39, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  holdButton: { backgroundColor: '#F2F3F5' }, holdText: { color: palette.ink, fontWeight: '700', fontSize: 13 },
  waiveButton: { backgroundColor: '#FFF4DD' }, waiveText: { color: '#9B6500', fontWeight: '700', fontSize: 13 },
  deductButton: { backgroundColor: palette.blue }, deductText: { color: palette.white, fontWeight: '700', fontSize: 13 },
  empty: { alignItems: 'center', marginTop: 100, paddingHorizontal: 30 },
  emptyTitle: { color: palette.ink, fontSize: 19, fontWeight: '800', marginTop: 14 },
  emptyCopy: { color: palette.muted, fontSize: 13, marginTop: 5, textAlign: 'center' },
});
