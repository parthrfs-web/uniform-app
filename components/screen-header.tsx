import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/constants/palette';

export function ScreenHeader({ title, eyebrow, action }: { title: string; eyebrow?: string; action?: ReactNode }) {
  return (
    <View style={styles.header}>
      <View>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 84, paddingHorizontal: 20, paddingTop: 11, paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { color: palette.muted, fontSize: 12, fontWeight: '600', marginBottom: 3 },
  title: { color: palette.ink, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  action: { width: 42, height: 42, borderRadius: 14, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.border, alignItems: 'center', justifyContent: 'center' },
});
