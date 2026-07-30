import { Tabs } from 'expo-router';
import React from 'react';
import NotchedTabBar from '@/components/NotchedTabBar';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <NotchedTabBar {...props} />}
    >
      <Tabs.Screen name="index"     options={{ title: 'Home' }} />
      <Tabs.Screen name="ledger"    options={{ title: 'Ledger' }} />
      <Tabs.Screen name="ai"        options={{ title: 'Brain' }} />
      <Tabs.Screen name="analytics" options={{ title: 'Insights' }} />
      <Tabs.Screen name="explore"   options={{ href: null }} />
    </Tabs>
  );
}
