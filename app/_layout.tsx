import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AppDataProvider } from '@/contexts/app-data';
import { AuthProvider, useAuth } from '@/contexts/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login';

    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  if (isLoading) return null;

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="employee/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="import" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="units" options={{ headerShown: false }} />
      <Stack.Screen name="items" options={{ headerShown: false }} />
      <Stack.Screen name="policies" options={{ headerShown: false }} />
      <Stack.Screen name="reports" options={{ headerShown: false }} />
      <Stack.Screen name="reports/monthly" options={{ headerShown: false }} />
      <Stack.Screen name="reports/pending" options={{ headerShown: false }} />
      <Stack.Screen name="reports/deductions" options={{ headerShown: false }} />
      <Stack.Screen name="reports/units" options={{ headerShown: false }} />
      <Stack.Screen name="import-history" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // Font asset removed from repository; mark fonts as loaded to continue.
  const loaded = true;

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AppDataProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootLayoutContent />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AppDataProvider>
    </AuthProvider>
  );
}
