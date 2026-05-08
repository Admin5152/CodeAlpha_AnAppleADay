import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../../contexts/AppContext';

export default function TabsLayout() {
  const { isDarkMode } = useApp();
  
  const bgColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const activeColor = '#F0485F';
  const inactiveColor = isDarkMode ? '#888888' : '#A0A0A0';

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: bgColor, borderTopColor: isDarkMode ? '#333' : '#F0F0F0', elevation: 0 },
      tabBarActiveTintColor: activeColor,
      tabBarInactiveTintColor: inactiveColor,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' }
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} /> }} />
      <Tabs.Screen name="bible" options={{ title: 'Bible', tabBarIcon: ({ color }) => <Feather name="book" size={24} color={color} /> }} />
      <Tabs.Screen name="devotional" options={{ title: 'Daily', tabBarIcon: ({ color }) => <Feather name="sun" size={24} color={color} /> }} />
      <Tabs.Screen name="saved" options={{ title: 'Saved', tabBarIcon: ({ color }) => <Feather name="bookmark" size={24} color={color} /> }} />
      <Tabs.Screen name="search" options={{ title: 'Search', tabBarIcon: ({ color }) => <Feather name="search" size={24} color={color} /> }} />
    </Tabs>
  );
}
