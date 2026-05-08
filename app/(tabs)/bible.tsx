import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SectionList, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useBible } from '../../contexts/BibleContext';
import { useApp } from '../../contexts/AppContext';
import { useRouter } from 'expo-router';

export default function BibleScreen() {
  const { books } = useBible();
  const { isDarkMode } = useApp();
  const router = useRouter();

  const [expandedBook, setExpandedBook] = useState<string | null>(null);

  const theme = {
    bg: isDarkMode ? '#121212' : '#FDF7F3',
    card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    subtext: isDarkMode ? '#AAAAAA' : '#6B6B6B',
    border: isDarkMode ? '#333333' : '#EAEAEA',
  };

  const sections = [
    { title: "Old Testament", data: books?.slice(0, 39) || [] },
    { title: "New Testament", data: books?.slice(39) || [] }
  ];

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    if (!item) return null;
    const isExpanded = expandedBook === item.name;
    return (
      <View style={[styles.bookRowWrapper, { backgroundColor: theme.card, borderColor: theme.border }, index === 0 && { borderTopWidth: 1 }, { borderBottomWidth: 1 }]}>
        <TouchableOpacity style={styles.bookRow} onPress={() => setExpandedBook(isExpanded ? null : item.name)}>
          <Text style={[styles.bookName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.chapterCount, { color: theme.subtext }]}>{item.chapters?.length || 0} Ch</Text>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.chaptersGrid}>
            {item.chapters?.map((_: any, i: number) => (
              <TouchableOpacity key={i} style={[styles.chapterBubble, { backgroundColor: isDarkMode ? '#333' : '#F5F5F5' }]} onPress={() => router.push(`/bible/${item.name}/${i + 1}`)}>
                <Text style={[styles.chapterNumber, { color: theme.text }]}>{i + 1}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.bg }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Bible</Text>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item?.name || Math.random().toString()}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <View style={[styles.sectionHeader, { backgroundColor: theme.bg }]}>
            <Text style={[styles.sectionTitle, { color: theme.subtext }]}>{title}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, zIndex: 10 },
  headerTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  listContent: { padding: 20, paddingBottom: 40 },
  sectionHeader: { marginTop: 10, marginBottom: 12, marginLeft: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 },
  bookRowWrapper: {},
  bookRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 20 },
  bookName: { fontSize: 16, fontWeight: '600' },
  chapterCount: { fontSize: 13, fontWeight: '500' },
  chaptersGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 },
  chapterBubble: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', margin: 4 },
  chapterNumber: { fontSize: 14, fontWeight: '600' }
});
