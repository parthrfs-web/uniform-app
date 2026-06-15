import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { palette } from '@/constants/palette';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.blue,
        tabBarInactiveTintColor: '#8A95A5',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
        tabBarStyle: { height: 68, paddingTop: 7, borderTopColor: palette.border, backgroundColor: palette.white },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="employees" options={{ title: 'Employees', tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="review" options={{ title: 'Review', tabBarIcon: ({ color, size }) => <Ionicons name="alert-circle-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="more" options={{ title: 'Manage', tabBarIcon: ({ color, size }) => <Ionicons name="menu-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
