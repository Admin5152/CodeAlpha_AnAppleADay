import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, Platform, StatusBar, LayoutAnimation } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBible } from '../../../contexts/BibleContext';
import { useApp } from '../../../contexts/AppContext';
import { Feather } from '@expo/vector-icons';

export default function ReadingScreen() {
  const { bookName, chapterIndex } = useLocalSearchParams();
  const { getChapter, updateLastRead, books } = useBible();
  const { isDarkMode, isSaved, toggleSavedVerse } = useApp();
  const router = useRouter();

  const chapterNum = parseInt(chapterIndex as string, 10);
  const bookStr = bookName as string;

  const [verses, setVerses] = useState<any[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  const theme = {
    bg: isDarkMode ? '#1A1A1A' : '#FDF7F3',
    text: isDarkMode ? '#E0E0E0' : '#1A1A1A',
    subtext: isDarkMode ? '#888888' : '#6B6B6B',
    highlight: isDarkMode ? '#F0485F40' : '#F0485F20',
    navBg: isDarkMode ? '#222222' : '#FFFFFF',
    border: isDarkMode ? '#333' : '#EAEAEA',
  };

  useEffect(() => {
    if (bookStr && chapterNum) {
      setVerses(getChapter(bookStr, chapterNum - 1) || []);
      updateLastRead(bookStr, chapterNum);
    }
  }, [bookStr, chapterNum]);

  const handleNextChapter = () => {
    const bookObj = books?.find(b => b.name === bookStr);
    if (!bookObj) return;
    if (chapterNum < (bookObj.chapters?.length || 0)) {
      router.replace(`/bible/${bookStr}/${chapterNum + 1}`);
    } else {
      const idx = books?.findIndex(b => b.name === bookStr);
      if (idx !== undefined && idx < (books?.length || 0) - 1) {
        router.replace(`/bible/${books[idx+1].name}/1`);
      }
    }
  };

  const handlePrevChapter = () => {
    if (chapterNum > 1) {
      router.replace(`/bible/${bookStr}/${chapterNum - 1}`);
    } else {
      const idx = books?.findIndex(b => b.name === bookStr);
      if (idx !== undefined && idx > 0) {
        router.replace(`/bible/${books[idx-1].name}/${books[idx-1].chapters?.length || 1}`);
      }
    }
  };

  const toggleSelect = (verseNum: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedVerse(prev => prev === verseNum ? null : verseNum);
  };

  const renderVerse = ({ item: v }: { item: any }) => {
    if (!v) return null;
    const isSelected = selectedVerse === v.verse;
    const saved = isSaved(bookStr, chapterNum, v.verse);
    
    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => toggleSelect(v.verse)}
        style={[styles.verseBlock, isSelected && { backgroundColor: theme.highlight, borderRadius: 8, padding: 8, marginHorizontal: -8 }]}
      >
        <Text style={[styles.verseText, { color: theme.text }]}>
          <Text style={[styles.verseNum, { color: '#F0485F' }]}>{v.verse} </Text>
          {v.text}
        </Text>
        
        {isSelected && (
          <View style={styles.contextMenu}>
            <TouchableOpacity style={styles.contextBtn} onPress={() => toggleSavedVerse(v)}>
              <Feather name="bookmark" size={18} color={saved ? '#F0485F' : theme.subtext} />
              <Text style={[styles.contextBtnText, { color: saved ? '#F0485F' : theme.subtext }]}>{saved ? 'Saved' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contextBtn}>
              <Feather name="share-2" size={18} color={theme.subtext} />
              <Text style={[styles.contextBtnText, { color: theme.subtext }]}>Share</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.navHeader, { backgroundColor: theme.navBg, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.text }]}>{bookStr} {chapterNum}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={verses}
        keyExtractor={(item) => item?.verse?.toString() || Math.random().toString()}
        renderItem={renderVerse}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={<Text style={[styles.chapterHeader, { color: theme.text }]}>{bookStr} {chapterNum}</Text>}
        ListFooterComponent={
          <View style={styles.pagination}>
            <TouchableOpacity style={[styles.pageBtn, { backgroundColor: theme.navBg, borderColor: theme.border }]} onPress={handlePrevChapter}>
              <Feather name="arrow-left" size={20} color={theme.text} />
              <Text style={[styles.pageBtnText, { color: theme.text }]}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pageBtn, { backgroundColor: theme.navBg, borderColor: theme.border }]} onPress={handleNextChapter}>
              <Text style={[styles.pageBtnText, { color: theme.text }]}>Next</Text>
              <Feather name="arrow-right" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05 },
  navBtn: { padding: 8 },
  navTitle: { fontSize: 18, fontWeight: '700' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 60, paddingTop: 30 },
  chapterHeader: { fontFamily: 'Georgia', fontSize: 36, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  verseBlock: { marginBottom: 16 },
  verseNum: { fontSize: 13, fontWeight: 'bold', top: -4 },
  verseText: { fontFamily: 'Georgia', fontSize: 20, lineHeight: 32 },
  contextMenu: { flexDirection: 'row', marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', paddingTop: 12, gap: 24 },
  contextBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contextBtnText: { fontSize: 13, fontWeight: '600' },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', paddingTop: 30 },
  pageBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 24, borderWidth: 1 },
  pageBtnText: { fontSize: 15, fontWeight: '600' }
});
