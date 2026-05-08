import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Verse } from './BibleContext';

interface SavedVerse extends Verse {
  id: string;
  note?: string;
  savedAt: number;
}

interface AppContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  savedVerses: SavedVerse[];
  toggleSavedVerse: (verse: Verse, note?: string) => void;
  isSaved: (book: string, chapter: number, verse: number) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dark = await AsyncStorage.getItem('darkMode');
        if (dark !== null) setIsDarkMode(dark === 'true');
        
        const saved = await AsyncStorage.getItem('savedVerses');
        if (saved) setSavedVerses(JSON.parse(saved));
      } catch (e) { console.error(e); }
    };
    loadData();
  }, []);

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await AsyncStorage.setItem('darkMode', String(newMode));
  };

  const toggleSavedVerse = async (verse: Verse, note?: string) => {
    const id = `${verse.book}-${verse.chapter}-${verse.verse}`;
    let newSaved;
    if (savedVerses.find(v => v.id === id)) {
      newSaved = savedVerses.filter(v => v.id !== id);
    } else {
      newSaved = [...savedVerses, { ...verse, id, note, savedAt: Date.now() }];
    }
    setSavedVerses(newSaved);
    await AsyncStorage.setItem('savedVerses', JSON.stringify(newSaved));
  };

  const isSaved = (book: string, chapter: number, verse: number) => {
    const id = `${book}-${chapter}-${verse}`;
    return savedVerses.some(v => v.id === id);
  };

  return (
    <AppContext.Provider value={{ isDarkMode, toggleDarkMode, savedVerses, toggleSavedVerse, isSaved }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};
