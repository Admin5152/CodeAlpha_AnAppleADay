import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useApp } from '../../contexts/AppContext';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SavedScreen() {
  const { savedVerses, isDarkMode, toggleSavedVerse } = useApp();
  const router = useRouter();

  const theme = {
    bg: isDarkMode ? '#121212' : '#FDF7F3',
    card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    subtext: isDarkMode ? '#AAAAAA' : '#6B6B6B',
    border: isDarkMode ? '#333333' : '#EAEAEA',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.bg }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Saved Verses</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {savedVerses.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="bookmark" size={60} color={theme.border} style={{ marginBottom: 20 }} />
            <Text style={[styles.emptyText, { color: theme.subtext }]}>No saved verses yet.</Text>
            <Text style={[styles.emptySub, { color: theme.subtext }]}>Highlight a verse while reading to save it here.</Text>
          </View>
        ) : (
          savedVerses.sort((a, b) => b.savedAt - a.savedAt).map(v => (
            <View key={v.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.verseRef, { color: '#F0485F' }]}>{v.book} {v.chapter}:{v.verse}</Text>
                <TouchableOpacity onPress={() => toggleSavedVerse(v)} style={styles.removeBtn}>
                  <Feather name="trash-2" size={18} color={theme.subtext} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.verseText, { color: theme.text }]}>"{v.text}"</Text>
              {v.note && (
                <View style={[styles.noteBox, { backgroundColor: isDarkMode ? '#2A2A2A' : '#FFF0F2' }]}>
                  <Text style={[styles.noteText, { color: theme.text }]}>{v.note}</Text>
                </View>
              )}
              <TouchableOpacity 
                style={styles.readBtn} 
                onPress={() => router.push(`/bible/${v.book}/${v.chapter}`)}
              >
                <Text style={[styles.readBtnText, { color: theme.subtext }]}>Read Full Chapter</Text>
                <Feather name="arrow-right" size={16} color={theme.subtext} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, zIndex: 10 },
  headerTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyText: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  card: { borderRadius: 20, borderWidth: 1, padding: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  verseRef: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  removeBtn: { padding: 4 },
  verseText: { fontFamily: 'Georgia', fontSize: 20, lineHeight: 30, fontStyle: 'italic', marginBottom: 20 },
  noteBox: { padding: 16, borderRadius: 12, marginBottom: 20 },
  noteText: { fontSize: 14, lineHeight: 22 },
  readBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 16 },
  readBtnText: { fontSize: 14, fontWeight: '600' }
});
