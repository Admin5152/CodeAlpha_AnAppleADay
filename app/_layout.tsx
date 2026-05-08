import { Stack } from 'expo-router';
import { BibleProvider } from '../contexts/BibleContext';
import { AppProvider } from '../contexts/AppContext';
import { ErrorBoundaryProps } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaView style={styles.errorContainer}>
      <View style={styles.errorCard}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={retry}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <BibleProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="bible/[bookName]/[chapterIndex]" options={{ presentation: 'card' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </BibleProvider>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: { flex: 1, backgroundColor: '#FDF7F3', alignItems: 'center', justifyContent: 'center', padding: 20 },
  errorCard: { backgroundColor: 'white', padding: 30, borderRadius: 20, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  errorTitle: { fontSize: 22, fontWeight: '800', marginBottom: 10, color: '#1A1A1A' },
  errorMessage: { fontSize: 14, color: '#6B6B6B', textAlign: 'center', marginBottom: 30 },
  retryBtn: { backgroundColor: '#F0485F', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 12 },
  retryText: { color: 'white', fontWeight: '700', fontSize: 16 }
});
