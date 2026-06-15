import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/constants/palette';
import { useAppData } from '@/contexts/app-data';

export default function ImportHistoryScreen() {
  const { importHistory } = useAppData();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={21} color={palette.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Import History</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={importHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.fileIcon}>
              <Ionicons name="document-outline" size={22} color={palette.green} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.fileName}>{item.fileName}</Text>
              <Text style={styles.meta}>{item.records} records · {item.importedAt}</Text>
              <Text style={styles.fingerprint}>Hash: {item.fingerprint}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={20} color={palette.green} />
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No import history available.</Text>
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
  fileIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EAF8F1', alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, marginLeft: 14 },
  fileName: { color: palette.ink, fontSize: 14, fontWeight: '700' },
  meta: { color: palette.muted, fontSize: 12, marginTop: 3 },
  fingerprint: { color: palette.muted, fontSize: 10, marginTop: 2, fontFamily: 'monospace' },
  empty: { color: palette.muted, textAlign: 'center', marginTop: 50 },
});
