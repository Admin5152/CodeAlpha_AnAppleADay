import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Clipboard,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View
} from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const INITIAL_QUOTES = [
  { id: "1", category: "Motivation", author: "Steve Jobs", text: "The only way to do great work is to love what you do." },
  { id: "2", category: "Motivation", author: "Winston Churchill", text: "Success is not final, failure is not fatal: It is the courage to continue that counts." },
  { id: "3", category: "Life", author: "Albert Einstein", text: "Life is like riding a bicycle. To keep your balance, you must keep moving." },
  { id: "4", category: "Love", author: "Dr. Seuss", text: "You know you're in love when you can't fall asleep because reality is finally better than your dreams." },
  { id: "5", category: "Tech", author: "Bill Gates", text: "The computer was born to solve problems that did not exist before." },
  { id: "6", category: "Motivation", author: "Nelson Mandela", text: "It always seems impossible until it's done." },
  { id: "7", category: "Life", author: "John Lennon", text: "Life is what happens when you're busy making other plans." },
  { id: "8", category: "Love", author: "Mahatma Gandhi", text: "Where there is love there is life." },
  { id: "9", category: "Tech", author: "Linus Torvalds", text: "Talk is cheap. Show me the code." },
  { id: "10", category: "Motivation", author: "Theodore Roosevelt", text: "Believe you can and you're halfway there." },
  { id: "11", category: "Life", author: "Socrates", text: "An unexamined life is not worth living." },
  { id: "12", category: "Love", author: "Leo Tolstoy", text: "All, everything that I understand, I understand only because I love." },
  { id: "13", category: "Tech", author: "Steve Jobs", text: "Design is not just what it looks like and feels like. Design is how it works." },
  { id: "14", category: "Motivation", author: "Walt Disney", text: "The way to get started is to quit talking and begin doing." },
  { id: "15", category: "Life", author: "Helen Keller", text: "Life is either a daring adventure or nothing at all." },
  { id: "16", category: "Love", author: "Victor Hugo", text: "The greatest happiness of life is the conviction that we are loved." },
  { id: "17", category: "Tech", author: "Arthur C. Clarke", text: "Any sufficiently advanced technology is indistinguishable from magic." },
  { id: "18", category: "Motivation", author: "Vince Lombardi", text: "It's not whether you get knocked down, it's whether you get up." },
  { id: "19", category: "Life", author: "Ralph Waldo Emerson", text: "Do not go where the path may lead, go instead where there is no path and leave a trail." },
  { id: "20", category: "Tech", author: "Tim Berners-Lee", text: "The Web as I envisaged it, we have not seen it yet. The future is still so much bigger than the past." },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Motivation: { bg: "#FFF3E0", text: "#E65100" },
  Life: { bg: "#E8F5E9", text: "#1B5E20" },
  Love: { bg: "#FCE4EC", text: "#880E4F" },
  Tech: { bg: "#E3F2FD", text: "#0D47A1" },
};

const LIGHT_THEME = {
  appBg: "#FFFDF5",
  cardBg: "white",
  cardBorder: "#FFE0E5",
  text: "#333",
  subtext: "#888",
  navBarBg: "white",
  inputBg: "#FFF5F6",
  chipInactive: "#FFF0F2",
  divider: "#F0F0F0",
  modalBg: "white",
};

const DARK_THEME = {
  appBg: "#1A1A1A",
  cardBg: "#2A2A2A",
  cardBorder: "#3A3A3A",
  text: "#F5F5F5",
  subtext: "#AAAAAA",
  navBarBg: "#222222",
  inputBg: "#333333",
  chipInactive: "#333333",
  divider: "#3A3A3A",
  modalBg: "#2A2A2A",
};

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  const [quotes, setQuotes] = useState(INITIAL_QUOTES);
  const categories = ["All", "Motivation", "Life", "Love", "Tech"];

  const [currentTab, setCurrentTab] = useState<"Home" | "Saved" | "Search">("Home");
  const [searchQuery, setSearchQuery] = useState("");

  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const isAnimating = useRef(false);

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isCopied, setIsCopied] = useState(false);
  const [pinnedQuoteId, setPinnedQuoteId] = useState<string | null>(null);
  const [hasShownPinnedOnce, setHasShownPinnedOnce] = useState(false);

  const [quoteOfTheDayId, setQuoteOfTheDayId] = useState<string | null>(null);

  // Settings State
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(9); // Default 9 AM

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const hideToastTimeout = useRef<NodeJS.Timeout | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [formText, setFormText] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [formCategory, setFormCategory] = useState("Motivation");
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  const newQuoteScale = useRef(new Animated.Value(1)).current;
  const handleNewQuotePressIn = () => Animated.timing(newQuoteScale, { toValue: 0.97, duration: 100, useNativeDriver: true }).start();
  const handleNewQuotePressOut = () => Animated.timing(newQuoteScale, { toValue: 1, duration: 100, useNativeDriver: true }).start();

  const fabScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (currentTab === "Home") {
      Animated.sequence([
        Animated.timing(fabScale, { toValue: 1.08, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
        Animated.timing(fabScale, { toValue: 1, duration: 300, useNativeDriver: true, easing: Easing.in(Easing.ease) })
      ]).start();
    }
  }, [currentTab]);

  useEffect(() => {
    const loadData = async () => {
      try {
        let savedQuotes, savedFavs, savedPinned, savedDark, savedReminder, savedTime;
        try {
          savedQuotes = await AsyncStorage.getItem("quotes");
          savedFavs = await AsyncStorage.getItem("favorites");
          savedPinned = await AsyncStorage.getItem("pinnedId");
          savedDark = await AsyncStorage.getItem("darkMode");
          savedReminder = await AsyncStorage.getItem("reminderEnabled");
          savedTime = await AsyncStorage.getItem("reminderTime");
        } catch (storageErr) {
          console.log("AsyncStorage read failed:", storageErr);
        }

        let loadedQuotes = INITIAL_QUOTES;
        if (savedQuotes) {
          loadedQuotes = JSON.parse(savedQuotes);
          setQuotes(loadedQuotes);
        }
        if (savedFavs) {
          setFavorites(new Set(JSON.parse(savedFavs)));
        }
        if (savedPinned) {
          setPinnedQuoteId(savedPinned);
        }
        if (savedDark !== null) {
          setIsDarkMode(savedDark === "true");
        }
        if (savedReminder !== null) {
          setReminderEnabled(savedReminder === "true");
        }
        if (savedTime !== null) {
          setReminderHour(parseInt(savedTime, 10));
        }

        // Quote of the day resolution
        let activeQotd = null;
        if (loadedQuotes.length > 0) {
          const randIdx = Math.floor(Math.random() * loadedQuotes.length);
          activeQotd = loadedQuotes[randIdx];
          setQuoteOfTheDayId(activeQotd.id);
        }

        // Fire Notifications re-sync
        if (savedReminder === "true" && activeQotd) {
          scheduleDailyReminder(parseInt(savedTime || "9", 10), activeQotd);
        }

      } catch (e) {
        console.log("Failed to load persistence", e);
      } finally {
        setIsReady(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => { if (isReady) AsyncStorage.setItem("quotes", JSON.stringify(quotes)).catch(e => console.log(e)); }, [quotes, isReady]);
  useEffect(() => { if (isReady) AsyncStorage.setItem("favorites", JSON.stringify(Array.from(favorites))).catch(e => console.log(e)); }, [favorites, isReady]);
  useEffect(() => {
    if (isReady) {
      if (pinnedQuoteId) AsyncStorage.setItem("pinnedId", pinnedQuoteId).catch(e => console.log(e));
      else AsyncStorage.removeItem("pinnedId").catch(e => console.log(e));
    }
  }, [pinnedQuoteId, isReady]);
  useEffect(() => { if (isReady) AsyncStorage.setItem("darkMode", String(isDarkMode)).catch(e => console.log(e)); }, [isDarkMode, isReady]);
  useEffect(() => { if (isReady) AsyncStorage.setItem("reminderEnabled", String(reminderEnabled)).catch(e => console.log(e)); }, [reminderEnabled, isReady]);
  useEffect(() => { if (isReady) AsyncStorage.setItem("reminderTime", String(reminderHour)).catch(e => console.log(e)); }, [reminderHour, isReady]);

  const toggleDarkMode = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsDarkMode(!isDarkMode);
  };

  const handleTabChange = (tab: any) => {
    if (tab === currentTab) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentTab(tab);
  };

  const scheduleDailyReminder = async (hour: number, quote: any) => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🍎 Your daily quote",
          body: `"${quote.text}" — ${quote.author}`,
        },
        trigger: {
          hour: hour,
          minute: 0,
          repeats: true,
        },
      });
    } catch (e) {
      console.log("Failed to schedule notification", e);
    }
  };

  const toggleReminderState = async (value: boolean) => {
    try {
      if (value) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          showToast("Notifications permission required!");
          return;
        }
        setReminderEnabled(true);
        const qotd = quotes.find(q => q.id === quoteOfTheDayId) || quotes[0];
        if (qotd) scheduleDailyReminder(reminderHour, qotd);
      } else {
        setReminderEnabled(false);
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    } catch (e) {
      console.log("Notifications not supported in this run state", e);
      setReminderEnabled(value); // fallback local toggle
    }
  };

  const updateReminderTime = (hour: number) => {
    setReminderHour(hour);
    const qotd = quotes.find(q => q.id === quoteOfTheDayId) || quotes[0];
    if (qotd) scheduleDailyReminder(hour, qotd);
    showToast(`Reminder set to ${hour <= 12 ? hour + " AM" : (hour - 12) + " PM"}`);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    Animated.timing(toastAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();

    if (hideToastTimeout.current) clearTimeout(hideToastTimeout.current);
    hideToastTimeout.current = setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }).start(() => setToastMessage(null));
    }, 2000);
  };

  const getRandomQuote = (catFilter: string, historyList: string[]) => {
    let pool = quotes;
    if (catFilter !== "All") {
      pool = quotes.filter((q) => q.category === catFilter);
    }
    if (pool.length === 0) {
      if (quotes.length === 0) return { id: "empty", text: "No quotes available.", author: "App", category: "Motivation" };
      pool = quotes;
    }
    let filteredPool = pool.filter((q) => !historyList.includes(q.id));
    if (filteredPool.length === 0) {
      filteredPool = pool;
    }
    const randIdx = Math.floor(Math.random() * filteredPool.length);
    return filteredPool[randIdx];
  };

  const initialQuote = getRandomQuote("All", []);
  const [activeCategory, setActiveCategory] = useState("All");
  const [history, setHistory] = useState([initialQuote.id]);
  const [currentQuote, setCurrentQuote] = useState(initialQuote);

  const animateTransition = (onHalfway: () => void, onComplete: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -40, duration: 250, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 250, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
    ]).start(() => {
      onHalfway();
      slideAnim.setValue(40);
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
      ]).start(() => onComplete());
    });
  };

  const changeQuote = (newCategory?: string) => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const targetCategory = newCategory || activeCategory;

    animateTransition(
      () => {
        let quote;
        if (pinnedQuoteId && !hasShownPinnedOnce && pinnedQuoteId !== currentQuote.id) {
          const pinned = quotes.find((q) => q.id === pinnedQuoteId);
          if (pinned) {
            quote = pinned;
            setHasShownPinnedOnce(true);
          }
        }
        if (!quote) quote = getRandomQuote(targetCategory, history);
        setCurrentQuote(quote);
        setHistory((prev) => {
          const newHist = [...prev, quote.id];
          if (newHist.length > 3) newHist.shift();
          return newHist;
        });
        if (newCategory) setActiveCategory(newCategory);
      },
      () => isAnimating.current = false
    );
  };

  const handleCategoryPress = (cat: string) => {
    if (cat === activeCategory || isAnimating.current) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    changeQuote(cat);
  };

  const toggleFavoriteWithId = (id: string) => {
    if (id === "empty") return;
    const newFavs = new Set(favorites);
    if (newFavs.has(id)) {
      newFavs.delete(id);
      showToast("Removed from favorites");
    } else {
      newFavs.add(id);
      showToast("Added to favorites");
    }
    setFavorites(newFavs);
  };

  const toggleFavoriteCurrent = () => toggleFavoriteWithId(currentQuote.id);

  const handleCopy = async () => {
    if (currentQuote.id === "empty") return;
    const textToCopy = `"${currentQuote.text}" — ${currentQuote.author}`;
    try {
      await Clipboard.setString(textToCopy);
      setIsCopied(true);
      showToast("Copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      showToast("Copy failed.");
    }
  };

  const handleShare = async () => {
    if (currentQuote.id === "empty") return;
    const textToShare = `🍎 An Apple A Day 🍎\n\n"${currentQuote.text}"\n\n✒️ — ${currentQuote.author}\n✨ Category: ${currentQuote.category}`;
    try {
      await Share.share({ message: textToShare, title: "Quote of the Day" });
    } catch (e) {
      showToast("Error executing share");
    }
  };

  const togglePin = () => {
    if (currentQuote.id === "empty") return;
    if (pinnedQuoteId === currentQuote.id) {
      setPinnedQuoteId(null);
      setHasShownPinnedOnce(false);
      showToast("Unpinned");
    } else {
      setPinnedQuoteId(currentQuote.id);
      setHasShownPinnedOnce(true);
      showToast("Quote pinned");
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormText("");
    setFormAuthor("");
    setFormCategory(activeCategory === "All" ? "Motivation" : activeCategory);
    setIsModalVisible(true);
  };

  const openEditModal = (quote?: { id: string, text: string, author: string, category: string }) => {
    const q = quote || currentQuote;
    if (q.id === "empty") return;
    setModalMode("edit");
    setFormText(q.text);
    setFormAuthor(q.author);
    setFormCategory(q.category);
    setEditingQuoteId(q.id);
    setIsModalVisible(true);
  };

  const saveQuoteForm = () => {
    if (!formText.trim() || !formAuthor.trim()) return;

    if (modalMode === "add") {
      const newQuote = {
        id: Date.now().toString(),
        text: formText,
        author: formAuthor,
        category: formCategory,
      };
      setQuotes([...quotes, newQuote]);
      showToast("Quote added!");
    } else {
      const updatedQuotes = quotes.map((q) =>
        q.id === editingQuoteId ? { ...q, text: formText, author: formAuthor, category: formCategory } : q
      );
      setQuotes(updatedQuotes);

      if (currentQuote.id === editingQuoteId) {
        setCurrentQuote({ ...currentQuote, text: formText, author: formAuthor, category: formCategory });
      }
      showToast("Quote updated!");
    }
    setIsModalVisible(false);
  };

  const deleteQuoteAction = (quoteId: string) => {
    const newQuotes = quotes.filter((q) => q.id !== quoteId);
    setQuotes(newQuotes);

    if (favorites.has(quoteId)) {
      const newFavs = new Set(favorites);
      newFavs.delete(quoteId);
      setFavorites(newFavs);
    }

    if (pinnedQuoteId === quoteId) {
      setPinnedQuoteId(null);
      setHasShownPinnedOnce(false);
    }

    if (currentQuote.id === quoteId) {
      let nextCurrent = newQuotes[0];
      if (newQuotes.length === 0) {
        nextCurrent = { id: "empty", text: "No quotes available.", author: "User", category: "Motivation" };
      }
      setCurrentQuote(nextCurrent);
    }
    showToast("Quote deleted");
  };

  const deleteQuoteForm = () => {
    if (editingQuoteId) {
      deleteQuoteAction(editingQuoteId);
      setIsModalVisible(false);
    }
  };

  if (!isReady) return <SafeAreaView style={styles.container} />; // Loading guard

  const poolCount = activeCategory === "All" ? quotes.length : quotes.filter((q) => q.category === activeCategory).length;
  const currentBadgeStyle = CATEGORY_COLORS[currentQuote.category] || CATEGORY_COLORS["Motivation"];
  const isFavorited = favorites.has(currentQuote.id);
  const isPinned = pinnedQuoteId === currentQuote.id;

  const renderListCard = ({ item }: { item: any }, isSearchScreen: boolean = false) => {
    const isFav = favorites.has(item.id);
    const badgeStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS["Motivation"];

    return (
      <View style={[styles.listCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View style={[styles.badge, { backgroundColor: badgeStyle.bg }]}>
          <Text style={[styles.badgeText, { color: badgeStyle.text }]}>{item.category}</Text>
        </View>
        <Text style={[styles.quoteText, { color: theme.text }]}>"{item.text}"</Text>
        <Text style={[styles.authorText, { color: theme.subtext }]}>— {item.author}</Text>

        <View style={[styles.listCardDivider, { backgroundColor: theme.divider }]} />

        <View style={styles.actionsRow}>
          {isSearchScreen && (
            <TouchableOpacity
              style={[styles.actionButton, isFav && styles.actionButtonActive]}
              onPress={() => toggleFavoriteWithId(item.id)}
            >
              <Feather name="heart" size={18} color={isFav ? "#F0485F" : theme.subtext} />
              <Text style={[styles.actionText, { color: theme.subtext }, isFav && { color: "#F0485F" }]}>Save</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(item)}>
            <Feather name="edit-2" size={18} color={theme.subtext} />
            <Text style={[styles.actionText, { color: theme.subtext }]}>Edit</Text>
          </TouchableOpacity>

          {isSearchScreen ? (
            <TouchableOpacity style={styles.actionButton} onPress={() => deleteQuoteAction(item.id)}>
              <Feather name="trash-2" size={18} color="#F0485F" />
              <Text style={[styles.actionText, { color: "#F0485F" }]}>Delete</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.actionButton} onPress={() => toggleFavoriteWithId(item.id)}>
              <Feather name="trash-2" size={18} color={theme.subtext} />
              <Text style={[styles.actionText, { color: theme.subtext }]}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderHomeScreen = () => (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>An Apple A Day</Text>
          <Text style={[styles.appSubtitle, { color: theme.subtext }]}>Quote Generator</Text>
        </View>
        <View style={styles.headerIconsRow}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => setIsSettingsVisible(true)}>
            <Feather name="settings" size={22} color={theme.subtext} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} onPress={toggleDarkMode}>
            <Feather name={isDarkMode ? "sun" : "moon"} size={22} color={theme.subtext} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {categories.map((cat, index) => {
            const isActive = cat === activeCategory;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleCategoryPress(cat)}
                style={[styles.chip, { backgroundColor: isActive ? "#F0485F" : theme.chipInactive }]}
              >
                <Text style={[styles.chipText, { color: isActive ? "white" : theme.subtext }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.cardContainer}>
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, opacity: opacityAnim, transform: [{ translateX: slideAnim }] },
          ]}
        >
          {quoteOfTheDayId === currentQuote.id && (
            <View style={styles.qotdBadge}>
              <Text style={styles.qotdText}>⭐ Quote of the Day</Text>
            </View>
          )}

          {isPinned && (
            <View style={[styles.pinIconContainer, { top: quoteOfTheDayId === currentQuote.id ? 10 : -8 }]}>
              <Text style={styles.pinEmoji}>📌</Text>
            </View>
          )}

          <View style={[styles.badge, { backgroundColor: currentBadgeStyle.bg }]}>
            <Text style={[styles.badgeText, { color: currentBadgeStyle.text }]}>{currentQuote.category}</Text>
          </View>

          <Text style={[styles.quoteText, { color: theme.text }]}>"{currentQuote.text}"</Text>
          <Text style={[styles.authorText, { color: theme.subtext }]}>— {currentQuote.author}</Text>

          <View style={[styles.cardDivider, { backgroundColor: theme.divider }]} />

          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionButton, isFavorited && styles.actionButtonActive]} onPress={toggleFavoriteCurrent}>
              <Feather name="heart" size={20} color={isFavorited ? "#F0485F" : theme.subtext} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, isCopied && styles.actionButtonSuccess]} onPress={handleCopy}>
              <Feather name={isCopied ? "check" : "copy"} size={20} color={isCopied ? "#2E7D32" : theme.subtext} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Feather name="share-2" size={20} color={theme.subtext} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, isPinned && styles.actionButtonPinActive]} onPress={togglePin}>
              <Feather name="map-pin" size={20} color={isPinned ? "#F0485F" : theme.subtext} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal()}>
              <Feather name="edit-2" size={20} color={theme.subtext} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.fabWrapper, { transform: [{ scale: fabScale }] }]}>
        <TouchableOpacity style={styles.fab} onPress={openAddModal}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.bottomContainer}>
        <Animated.View style={{ transform: [{ scale: newQuoteScale }] }}>
          <TouchableOpacity style={styles.newQuoteButton} onPressIn={handleNewQuotePressIn} onPressOut={handleNewQuotePressOut} onPress={() => changeQuote()}>
            <Text style={styles.newQuoteText}>✨ New Quote</Text>
          </TouchableOpacity>
        </Animated.View>
        <Text style={[styles.statsText, { color: theme.subtext }]}>{poolCount} quotes · {favorites.size} saved</Text>
      </View>
    </View>
  );

  const renderSavedScreen = () => {
    const savedList = quotes.filter((q) => favorites.has(q.id));
    return (
      <View style={styles.screenContainer}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>❤️ Saved Quotes ({favorites.size})</Text>
        </View>
        <FlatList
          data={savedList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={(props) => renderListCard(props, false)}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateEmoji}>🍎</Text>
              <Text style={[styles.emptyStateText, { color: theme.subtext }]}>No saved quotes yet. Tap the heart on any quote!</Text>
            </View>
          }
        />
      </View>
    );
  };

  const renderSearchScreen = () => {
    const list = searchQuery.trim()
      ? quotes.filter((q) =>
        q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
      : [];

    return (
      <View style={styles.screenContainer}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>🔍 Search Quotes</Text>
        </View>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.inputBg, borderColor: theme.cardBorder, color: theme.text }]}
          placeholder="Type something to search..."
          placeholderTextColor={theme.subtext}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.trim() !== "" && (
          <Text style={[styles.resultCountText, { color: theme.subtext }]}>{list.length} results</Text>
        )}
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={(props) => renderListCard(props, true)}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateEmoji}>🔍</Text>
              <Text style={[styles.emptyStateText, { color: theme.subtext }]}>
                {searchQuery.trim() === "" ? "Type something to search" : "No quotes found"}
              </Text>
            </View>
          }
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.appBg }]}>
      {currentTab === "Home" && renderHomeScreen()}
      {currentTab === "Saved" && renderSavedScreen()}
      {currentTab === "Search" && renderSearchScreen()}

      <View style={[styles.bottomNav, { backgroundColor: theme.navBarBg, borderTopColor: theme.cardBorder }]}>
        <TouchableOpacity style={styles.navTab} onPress={() => handleTabChange("Home")}>
          <Feather name="home" size={24} color={currentTab === "Home" ? "#F0485F" : theme.subtext} />
          <Text style={[styles.navLabel, currentTab === "Home" && { color: "#F0485F" }, { color: theme.subtext }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navTab} onPress={() => handleTabChange("Saved")}>
          <Feather name="heart" size={24} color={currentTab === "Saved" ? "#F0485F" : theme.subtext} />
          <Text style={[styles.navLabel, currentTab === "Saved" && { color: "#F0485F" }, { color: theme.subtext }]}>Saved</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navTab} onPress={() => handleTabChange("Search")}>
          <Feather name="search" size={24} color={currentTab === "Search" ? "#F0485F" : theme.subtext} />
          <Text style={[styles.navLabel, currentTab === "Search" && { color: "#F0485F" }, { color: theme.subtext }]}>Search</Text>
        </TouchableOpacity>
      </View>

      {toastMessage && (
        <Animated.View style={[styles.toastContainer, { opacity: toastAnim }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      {/* Settings Modal */}
      <Modal visible={isSettingsVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.bottomSheet, { backgroundColor: theme.modalBg }]}>
            <View style={styles.modalDragIndicator} />
            <Text style={[styles.modalTitle, { color: theme.text }]}>⚙️ Settings</Text>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Daily Reminders</Text>
              <Switch value={reminderEnabled} onValueChange={toggleReminderState} trackColor={{ true: "#F0485F", false: theme.inputBg }} />
            </View>

            {reminderEnabled && (
              <View style={styles.timePickerContainer}>
                <Text style={[styles.subLabel, { color: theme.subtext }]}>Reminder Time</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {[8, 9, 10, 11, 12, 17, 18, 20].map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[styles.timeChip, reminderHour === h && { backgroundColor: "#F0485F", borderColor: "#F0485F" }]}
                      onPress={() => updateReminderTime(h)}
                    >
                      <Text style={{ color: reminderHour === h ? "white" : theme.subtext, fontWeight: '600' }}>
                        {h <= 12 ? `${h} AM` : `${h - 12} PM`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <TouchableOpacity style={[styles.modalSaveButton, { marginTop: 24 }]} onPress={() => setIsSettingsVisible(false)}>
              <Text style={styles.modalSaveButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Quote Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={[styles.bottomSheet, { backgroundColor: theme.modalBg }]}>
              <View style={styles.modalDragIndicator} />
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {modalMode === "add" ? "➕ Add New Quote" : "✏️ Edit Quote"}
              </Text>

              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.inputBg, borderColor: theme.cardBorder, color: theme.text }]}
                placeholder="Enter quote text..."
                placeholderTextColor={theme.subtext}
                value={formText}
                onChangeText={setFormText}
                multiline
              />

              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.cardBorder, color: theme.text }]}
                placeholder="Author name"
                placeholderTextColor={theme.subtext}
                value={formAuthor}
                onChangeText={setFormAuthor}
              />

              <View style={styles.segmentContainer}>
                {categories.filter(c => c !== "All").map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.segmentOption, { backgroundColor: formCategory === cat ? "#F0485F" : theme.chipInactive, borderColor: formCategory === cat ? "#F0485F" : theme.chipInactive }]}
                    onPress={() => setFormCategory(cat)}
                  >
                    <Text style={[styles.segmentText, { color: formCategory === cat ? "white" : theme.subtext }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.modalSaveButton, (!formText.trim() || !formAuthor.trim()) && { opacity: 0.5 }]}
                onPress={saveQuoteForm}
                disabled={!formText.trim() || !formAuthor.trim()}
              >
                <Text style={styles.modalSaveButtonText}>Save Quote</Text>
              </TouchableOpacity>

              {modalMode === "edit" && (
                <TouchableOpacity style={styles.modalDeleteButton} onPress={deleteQuoteForm}>
                  <Text style={styles.modalDeleteButtonText}>🗑 Delete This Quote</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  screenContainer: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  headerIconsRow: { flexDirection: "row", alignItems: "center" },
  headerIconBtn: { marginLeft: 16, padding: 4 },
  appTitle: { color: "#F0485F", fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  appSubtitle: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: "600" },
  moonButton: { padding: 4 },
  categoriesContainer: { marginTop: 10, marginBottom: 30 },
  categoriesScroll: { paddingHorizontal: 16 },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginHorizontal: 6 },
  chipText: { fontSize: 12, fontWeight: "600" },
  cardContainer: { flex: 1, paddingHorizontal: 20 },
  card: { borderRadius: 24, borderWidth: 1.5, paddingTop: 32, paddingHorizontal: 28, paddingBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 3 },
  qotdBadge: { position: 'absolute', top: -14, alignSelf: 'center', backgroundColor: '#FFF0F2', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, zIndex: 20, borderWidth: 1, borderColor: '#FFE0E5' },
  qotdText: { fontSize: 11, fontWeight: 'bold', color: '#F0485F' },
  pinIconContainer: { position: "absolute", alignSelf: "center", zIndex: 10 },
  pinEmoji: { fontSize: 18 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: "flex-start", marginBottom: 20 },
  badgeText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  quoteText: { fontFamily: "Georgia", fontSize: 18, lineHeight: 29.7, fontStyle: "italic" },
  authorText: { marginTop: 20, fontSize: 13, fontWeight: "bold", fontFamily: Platform.OS === "ios" ? "System" : "sans-serif" },
  cardDivider: { height: 1, marginTop: 30, marginBottom: 16 },
  actionsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 0 },
  actionButton: { alignItems: "center", justifyContent: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  actionButtonActive: { backgroundColor: "#FFE8EB" },
  actionButtonSuccess: { backgroundColor: "#E8F5E9" },
  actionButtonPinActive: { backgroundColor: "#FFF0F2" },
  actionText: { fontSize: 11, marginTop: 6, fontWeight: "600" },
  bottomContainer: { paddingHorizontal: 20, paddingBottom: 16, marginTop: "auto" },
  newQuoteButton: { backgroundColor: "#F0485F", borderRadius: 20, paddingVertical: 16, alignItems: "center", shadowColor: "#F0485F", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  newQuoteText: { color: "white", fontSize: 16, fontWeight: "bold", letterSpacing: 0.5 },
  statsText: { fontSize: 12, textAlign: "center", marginTop: 12, fontWeight: "500" },
  fabWrapper: { position: "absolute", bottom: 120, right: 24, zIndex: 50 },
  fab: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#F0485F", alignItems: "center", justifyContent: "center", shadowColor: "#F0485F", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  fabText: { color: "white", fontSize: 26, lineHeight: 28, fontWeight: "300" },
  toastContainer: { position: "absolute", bottom: 90, alignSelf: "center", backgroundColor: "#222", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20, zIndex: 100, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  toastText: { color: "white", fontSize: 13, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  bottomSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 28, paddingHorizontal: 24, paddingBottom: 40 },
  modalDragIndicator: { width: 40, height: 5, backgroundColor: "#AAA", borderRadius: 3, alignSelf: "center", marginBottom: 24, position: "absolute", top: 12 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  input: { borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16, fontSize: 16 },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  segmentContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 24 },
  segmentOption: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, marginRight: 10, marginTop: 10 },
  segmentOptionActive: {},
  segmentText: { fontWeight: "600" },
  segmentTextActive: {},
  modalSaveButton: { backgroundColor: "#F0485F", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginBottom: 16 },
  modalSaveButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  modalCancelButton: { alignItems: "center", paddingVertical: 12 },
  modalCancelButtonText: { color: "#666", fontWeight: "600", fontSize: 15 },
  modalDeleteButton: { backgroundColor: "#F0485F22", borderRadius: 14, paddingVertical: 16, alignItems: "center", borderWidth: 1.5, borderColor: "#F0485F", marginBottom: 16 },
  modalDeleteButtonText: { color: "#F0485F", fontWeight: "bold", fontSize: 16 },
  bottomNav: { flexDirection: "row", borderTopWidth: 1, paddingTop: 12, paddingBottom: Platform.OS === "ios" ? 30 : 12 },
  navTab: { flex: 1, alignItems: "center", justifyContent: "center" },
  navLabel: { fontSize: 10, fontFamily: Platform.OS === "ios" ? "System" : "sans-serif", fontWeight: "600", marginTop: 4 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  listCard: { borderRadius: 16, borderWidth: 1.5, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  listCardDivider: { height: 1, marginTop: 20, marginBottom: 16 },
  searchInput: { borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginHorizontal: 24, marginBottom: 16 },
  emptyStateContainer: { alignItems: "center", marginTop: 40 },
  emptyStateEmoji: { fontSize: 48, marginBottom: 16 },
  emptyStateText: { textAlign: "center", fontSize: 14 },
  resultCountText: { textAlign: "center", marginBottom: 20, fontSize: 12 },
  settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#E0E0E0" },
  settingLabel: { fontSize: 16, fontWeight: "500" },
  timePickerContainer: { marginTop: 24 },
  subLabel: { fontSize: 14, fontWeight: "600", marginBottom: 12 },
  timeChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: "#E0E0E0", marginRight: 12 },
});
