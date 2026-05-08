import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useBible } from '../../contexts/BibleContext';
import { useApp } from '../../contexts/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { dailyVerse, lastRead, isReady } = useBible();
  const { isDarkMode } = useApp();
  const router = useRouter();

  const theme = {
    bg: isDarkMode ? '#121212' : '#FDF7F3',
    card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    subtext: isDarkMode ? '#AAAAAA' : '#6B6B6B',
    border: isDarkMode ? '#333333' : '#EAEAEA',
  };

  const handleContinueReading = () => {
    if (lastRead) {
      router.push(`/bible/${lastRead.book}/${lastRead.chapter}`);
    } else {
      router.push('/bible/Genesis/1');
    }
  };

  const handleDevotional = () => {
    router.push('/devotional');
  };

  if (!isReady) return <SafeAreaView style={[styles.container, { backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator size='large' color='#F0485F' /></SafeAreaView>;
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.subtext }]}>Today's Word</Text>
          <Text style={[styles.date, { color: theme.text }]}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>

        {dailyVerse && (
          <TouchableOpacity activeOpacity={0.9} style={[styles.verseCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push(`/bible/${dailyVerse.book}/${dailyVerse.chapter}`)}>
            <LinearGradient colors={['rgba(240, 72, 95, 0.05)', 'rgba(255, 107, 125, 0.02)']} style={StyleSheet.absoluteFillObject} />
            <Text style={[styles.verseText, { color: theme.text }]}>"{dailyVerse.text}"</Text>
            <View style={styles.verseRefContainer}>
              <View style={styles.refAccent} />
              <Text style={[styles.verseRef, { color: theme.subtext }]}>{dailyVerse.book} {dailyVerse.chapter}:{dailyVerse.verse}</Text>
            </View>
          </TouchableOpacity>
        )}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Jump Back In</Text>
        
        <View style={styles.actionCardsRow}>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={handleContinueReading}>
            <View style={[styles.iconBox, { backgroundColor: '#F0485F20' }]}>
              <Feather name="book-open" size={20} color="#F0485F" />
            </View>
            <Text style={[styles.actionCardTitle, { color: theme.text }]}>Continue Reading</Text>
            <Text style={[styles.actionCardSub, { color: theme.subtext }]}>{lastRead ? `${lastRead.book} ${lastRead.chapter}` : 'Genesis 1'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={handleDevotional}>
            <View style={[styles.iconBox, { backgroundColor: '#F0485F20' }]}>
              <Feather name="sun" size={20} color="#F0485F" />
            </View>
            <Text style={[styles.actionCardTitle, { color: theme.text }]}>Daily Devotional</Text>
            <Text style={[styles.actionCardSub, { color: theme.subtext }]}>Spiritual Moment</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  header: { marginBottom: 32, marginTop: 16 },
  greeting: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  date: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  verseCard: { borderRadius: 24, padding: 32, marginBottom: 40, borderWidth: 1, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 4 },
  verseText: { fontFamily: 'Georgia', fontSize: 24, lineHeight: 36, fontStyle: 'italic', marginBottom: 24 },
  verseRefContainer: { flexDirection: 'row', alignItems: 'center' },
  refAccent: { width: 20, height: 2, backgroundColor: '#F0485F', marginRight: 12 },
  verseRef: { fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, letterSpacing: -0.2 },
  actionCardsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionCard: { flex: 1, borderRadius: 20, padding: 20, borderWidth: 1, marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  actionCardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  actionCardSub: { fontSize: 13, fontWeight: '500' }
});
