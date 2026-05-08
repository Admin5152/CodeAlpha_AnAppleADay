import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar, ImageBackground, ScrollView, Animated } from 'react-native';
import { useApp } from '../../contexts/AppContext';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const devotionals = [
  { id: "1", date: "2026-05-04", title: "Peace in the Storm", verse: "Romans 5:1", scripture: "Therefore being justified by faith, we have peace with God through our Lord Jesus Christ.", message: "Even in the midst of chaos, God offers a peace that surpasses all understanding. When the storms of life rage around us, we can find an anchor in His promises. Take a moment today to breathe, let go of your anxieties, and allow His perfect peace to settle over your heart. You are not alone; the Creator of the universe is walking right beside you.", prayer: "Lord, help me trust You today. Quiet the storms in my mind and let Your peace reign in my heart." },
  { id: "2", date: "2026-05-05", title: "Strength for the Journey", verse: "Isaiah 40:31", scripture: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles...", message: "Waiting is often the hardest part of faith. Yet, it is in the waiting that God does His deepest work within us. He uses the pauses to build our endurance and prepare us for the flight ahead. If you feel weary today, lean into Him. He promises to renew your strength.", prayer: "Father, give me the patience to wait on Your perfect timing. Renew my strength for the tasks ahead." },
  { id: "3", date: "2026-05-06", title: "A Lamp Unto My Feet", verse: "Psalm 119:105", scripture: "Thy word is a lamp unto my feet, and a light unto my path.", message: "We often want God to show us the entire map of our future, but He usually only provides enough light for the next step. By trusting His Word daily, we learn to walk by faith, not by sight. Open the Word today and let it illuminate the very next step you need to take.", prayer: "God, illuminate my path today. Help me to trust Your guidance even when I cannot see the final destination." },
  { id: "4", date: "2026-05-07", title: "The Power of Love", verse: "1 Corinthians 13:4", scripture: "Charity suffereth long, and is kind; charity envieth not...", message: "True love requires patience and kindness, especially when it's difficult. It's easy to love those who are easy to love, but God calls us to a higher standard. Let your actions today be driven by a selfless, enduring love that reflects the heart of Christ.", prayer: "Lord, fill me with Your love. Help me to be patient and kind to everyone I encounter today." }
];

const devotionalImages = [
  require('../../assets/devotional/1.jpg'),
  require('../../assets/devotional/2.jpg'),
  require('../../assets/devotional/3.jpg'),
  require('../../assets/devotional/4.jpg')
];

export default function DevotionalScreen() {
  const { isDarkMode } = useApp();
  const [completed, setCompleted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Compute daily logic
  const todayDateStr = new Date().toISOString().split('T')[0];
  // Fallback to first devotional if date not found (for testing/mock purposes)
  const currentDevotional = devotionals.find(d => d.date === todayDateStr) || devotionals[0];
  
  const dayIndex = new Date().getDate() % devotionalImages.length;
  const currentImage = devotionalImages[dayIndex];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const checkCompleted = async () => {
      try {
        const val = await AsyncStorage.getItem(`devotional_completed_${todayDateStr}`);
        if (val === 'true') setCompleted(true);
      } catch (e) {}
    };
    checkCompleted();
  }, []);

  const handleComplete = async () => {
    setCompleted(true);
    await AsyncStorage.setItem(`devotional_completed_${todayDateStr}`, 'true');
  };

  const overlayColor = isDarkMode ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.4)';

  return (
    <View style={styles.container}>
      <ImageBackground source={currentImage || require("../../assets/images/icon.png")} style={styles.bgImage} resizeMode="cover">
        <View style={[styles.overlay, { backgroundColor: overlayColor }]} />
        
        <SafeAreaView style={styles.safeArea}>
          <Animated.ScrollView contentContainerStyle={styles.scrollContent} style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false}>
            
            <View style={styles.header}>
              <Text style={styles.dateLabel}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
              <Text style={styles.title}>{currentDevotional.title}</Text>
            </View>

            <View style={styles.card}>
              <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)']} style={StyleSheet.absoluteFillObject} />
              
              <View style={styles.verseHeader}>
                <View style={styles.accentBar} />
                <Text style={styles.verseRef}>{currentDevotional.verse}</Text>
              </View>
              
              <Text style={styles.scripture}>"{currentDevotional.scripture}"</Text>
              
              <View style={styles.divider} />
              
              <Text style={styles.message}>{currentDevotional.message}</Text>
              
              <View style={styles.prayerBox}>
                <Text style={styles.prayerLabel}>Daily Prayer</Text>
                <Text style={styles.prayerText}>{currentDevotional.prayer}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.completeBtn, completed && styles.completedBtn]} 
              onPress={handleComplete}
              disabled={completed}
            >
              <Feather name={completed ? "check-circle" : "circle"} size={20} color="white" />
              <Text style={styles.completeBtnText}>{completed ? "Completed Today" : "Mark as Completed"}</Text>
            </TouchableOpacity>
            
          </Animated.ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject },
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  scrollContent: { padding: 24, paddingBottom: 60, paddingTop: 40 },
  header: { marginBottom: 40, alignItems: 'center' },
  dateLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 },
  title: { color: 'white', fontSize: 36, fontWeight: '800', textAlign: 'center', lineHeight: 42, letterSpacing: -0.5 },
  card: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 24, padding: 32, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 30 },
  verseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  accentBar: { width: 20, height: 2, backgroundColor: '#F0485F', marginRight: 12 },
  verseRef: { color: 'white', fontSize: 14, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  scripture: { fontFamily: 'Georgia', fontSize: 24, lineHeight: 36, color: 'white', fontStyle: 'italic', marginBottom: 24 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 24 },
  message: { fontSize: 16, lineHeight: 28, color: 'rgba(255,255,255,0.9)', marginBottom: 32 },
  prayerBox: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  prayerLabel: { color: '#F0485F', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  prayerText: { fontFamily: 'Georgia', fontSize: 18, lineHeight: 28, color: 'white', fontStyle: 'italic' },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0485F', paddingVertical: 18, borderRadius: 20, gap: 10, shadowColor: '#F0485F', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  completedBtn: { backgroundColor: '#2E7D32', shadowColor: '#2E7D32' },
  completeBtnText: { color: 'white', fontSize: 16, fontWeight: '700' }
});
