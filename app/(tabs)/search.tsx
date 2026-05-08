import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { useBible } from '../../contexts/BibleContext';
import { useApp } from '../../contexts/AppContext';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SearchScreen() {
  const { books } = useBible();
  const { isDarkMode } = useApp();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const theme = {
    bg: isDarkMode ? '#121212' : '#FDF7F3',
    card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    subtext: isDarkMode ? '#AAAAAA' : '#6B6B6B',
    border: isDarkMode ? '#333333' : '#EAEAEA',
    inputBg: isDarkMode ? '#222222' : '#FFFFFF',
  };

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeout.current = setTimeout(() => {
      performSearch(query);
    }, 500); // 500ms debounce
    
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return;

    // Use a Promise to avoid blocking the UI thread entirely
    await new Promise(resolve => setTimeout(resolve, 0));

    const hits: any[] = [];
    
    for (let b of books) {
      if (b.name.toLowerCase().includes(q)) {
        hits.push({ type: 'book', book: b.name, title: `Book of ${b.name}` });
      }
      for (let c = 0; c < b.chapters.length; c++) {
        for (let v = 0; v < b.chapters[c].length; v++) {
          if (b.chapters[c][v].toLowerCase().includes(q)) {
            hits.push({ type: 'verse', book: b.name, chapter: c + 1, verse: v + 1, text: b.chapters[c][v] });
          }
          if (hits.length >= 50) break;
        }
        if (hits.length >= 50) break;
      }
      if (hits.length >= 50) break;
    }
    
    setResults(hits);
    setIsSearching(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.bg }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Search</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={[styles.inputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <Feather name="search" size={20} color={theme.subtext} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Search books or verses..."
            placeholderTextColor={theme.subtext}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && !isSearching && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
              <Feather name="x-circle" size={20} color={theme.subtext} />
            </TouchableOpacity>
          )}
          {isSearching && <ActivityIndicator size="small" color="#F0485F" />}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          if (item.type === 'book') {
            return (
              <TouchableOpacity style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push(`/bible/${item.book}/1`)}>
                <View style={styles.bookIcon}><Feather name="book" size={20} color="#F0485F" /></View>
                <Text style={[styles.bookResultText, { color: theme.text }]}>{item.title}</Text>
              </TouchableOpacity>
            );
          }
          
          return (
            <TouchableOpacity style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push(`/bible/${item.book}/${item.chapter}`)}>
              <Text style={[styles.verseRef, { color: '#F0485F' }]}>{item.book} {item.chapter}:{item.verse}</Text>
              <Text style={[styles.verseText, { color: theme.text }]} numberOfLines={3}>"{item.text}"</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          query.trim() && !isSearching ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.subtext }]}>No results found.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, zIndex: 10 },
  headerTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  searchContainer: { padding: 20 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, height: 56 },
  input: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '500' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  resultCard: { borderRadius: 16, borderWidth: 1, padding: 20, marginBottom: 12 },
  bookIcon: { marginBottom: 8 },
  bookResultText: { fontSize: 18, fontWeight: '700' },
  verseRef: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  verseText: { fontFamily: 'Georgia', fontSize: 16, lineHeight: 24, fontStyle: 'italic' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, fontWeight: '500' }
});
