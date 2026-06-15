import { useState } from 'react';
import { StyleSheet, Text, TextInput, Pressable, View, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { palette } from '@/constants/palette';
import { useAuth } from '@/contexts/auth';

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }

    setLoading(true);
    const success = await login(username, password);
    setLoading(false);

    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Login failed', 'Invalid username or password.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Ionicons name="shirt-outline" size={40} color={palette.white} />
          </View>
          <Text style={styles.title}>Uniform Manager</Text>
          <Text style={styles.subtitle}>Enter your credentials to continue</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. admin"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Pressable style={[styles.button, loading && styles.disabled]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Login</Text>}
          </Pressable>

          <View style={styles.hint}>
            <Text style={styles.hintText}>Admin: admin / admin123</Text>
            <Text style={styles.hintText}>Manager: manager / manager123</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 50 },
  logo: { width: 80, height: 80, borderRadius: 24, backgroundColor: palette.blue, alignItems: 'center', justifyContent: 'center', marginBottom: 20, elevation: 8, shadowColor: palette.blue, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  title: { fontSize: 28, fontWeight: '900', color: palette.ink },
  subtitle: { fontSize: 14, color: palette.muted, marginTop: 8 },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700', color: palette.ink, marginLeft: 4 },
  input: { height: 55, backgroundColor: palette.white, borderRadius: 16, paddingHorizontal: 20, borderWidth: 1.5, borderColor: palette.border, color: palette.ink, fontSize: 15 },
  button: { height: 55, backgroundColor: palette.blue, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10, elevation: 4, shadowColor: palette.blue, shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  disabled: { opacity: 0.7 },
  buttonText: { color: palette.white, fontSize: 16, fontWeight: '800' },
  hint: { marginTop: 30, alignItems: 'center', gap: 5 },
  hintText: { fontSize: 12, color: palette.muted },
});
