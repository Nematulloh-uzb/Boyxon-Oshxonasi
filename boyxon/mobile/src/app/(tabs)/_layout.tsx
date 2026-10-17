import { Tabs } from 'expo-router';
import React from 'react';
import { BottomTabs } from '../../components/BottomTabs';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabs {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="savat" />
      <Tabs.Screen name="sozlamalar" />
    </Tabs>
  );
}
