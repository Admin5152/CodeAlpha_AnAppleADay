import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Verse = { verse: number; text: string; book: string; chapter: number };
export type Book = { abbrev: string; name: string; chapters: string[][] };

interface BibleContextType {
  books: Book[];
  dailyVerse: Verse | null;
  lastRead: { book: string; chapter: number } | null;
  updateLastRead: (book: string, chapter: number) => void;
  getChapter: (bookName: string, chapterIndex: number) => Verse[];
  isReady: boolean;
}

const BibleContext = createContext<BibleContextType | undefined>(undefined);

export const BibleProvider = ({ children }: { children: ReactNode }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [dailyVerse, setDailyVerse] = useState<Verse | null>(null);
  const [lastRead, setLastRead] = useState<{ book: string; chapter: number } | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      try {
        // Load data safely
        const bibleData = require('../assets/bible.json');
        setBooks(bibleData);

        const savedLastRead = await AsyncStorage.getItem('lastRead');
        if (savedLastRead) setLastRead(JSON.parse(savedLastRead));
        
        // Setup daily verse (random for now, ideally tied to date)
        if (bibleData && bibleData.length > 0) {
          const randBook = bibleData[Math.floor(Math.random() * bibleData.length)];
          if (randBook && randBook.chapters && randBook.chapters.length > 0) {
            const randChapIdx = Math.floor(Math.random() * randBook.chapters.length);
            if (randBook.chapters[randChapIdx] && randBook.chapters[randChapIdx].length > 0) {
              const randVerseIdx = Math.floor(Math.random() * randBook.chapters[randChapIdx].length);
              setDailyVerse({
                book: randBook.name,
                chapter: randChapIdx + 1,
                verse: randVerseIdx + 1,
                text: randBook.chapters[randChapIdx][randVerseIdx]
              });
            }
          }
        }
      } catch (e) { 
        console.log("Error loading Bible data:", e); 
      } finally {
        setIsReady(true);
      }
    };
    loadState();
  }, []);

  const updateLastRead = async (book: string, chapter: number) => {
    try {
      setLastRead({ book, chapter });
      await AsyncStorage.setItem('lastRead', JSON.stringify({ book, chapter }));
    } catch (e) {
      console.log("Failed to save last read state");
    }
  };

  const getChapter = (bookName: string, chapterIndex: number): Verse[] => {
    try {
      const book = books.find((b: Book) => b.name === bookName);
      if (!book || !book.chapters || !book.chapters[chapterIndex]) return [];
      return book.chapters[chapterIndex].map((text: string, i: number) => ({
        verse: i + 1,
        text: text || '',
        book: bookName,
        chapter: chapterIndex + 1
      }));
    } catch (e) {
      return [];
    }
  };

  return (
    <BibleContext.Provider value={{ books, dailyVerse, lastRead, updateLastRead, getChapter, isReady }}>
      {children}
    </BibleContext.Provider>
  );
};

export const useBible = () => {
  const context = useContext(BibleContext);
  if (!context) throw new Error("useBible must be used within a BibleProvider");
  return context;
};
