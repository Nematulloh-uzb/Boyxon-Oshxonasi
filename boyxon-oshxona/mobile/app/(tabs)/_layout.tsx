import { Tabs } from 'expo-router';
import { ranglar } from '../../src/constants/colors';
import { TabIkonka } from '../../src/components/navigation/TabBarIcon';

// Pastki navigatsiya — XATO 14 tuzatish: Expo Router tabs + savat badge
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ranglar.asosiy,
        tabBarInactiveTintColor: ranglar.matn2,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: ranglar.border },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Asosiy', tabBarIcon: () => <TabIkonka emoji="🏠" /> }} />
      <Tabs.Screen name="cart" options={{ title: 'Savatcha', tabBarIcon: () => <TabIkonka emoji="🧺" savat /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Sozlamalar', tabBarIcon: () => <TabIkonka emoji="⚙️" /> }} />
    </Tabs>
  );
}
