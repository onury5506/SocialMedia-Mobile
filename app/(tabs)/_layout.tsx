import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Avatar, Surface, useTheme } from 'react-native-paper';
import { selectProfile } from '@/slices/userSlice';
import { useSelector } from 'react-redux';
import { View } from 'react-native';

export default function TabLayout() {
  const theme = useTheme();
  const profile = useSelector(selectProfile);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
        },
        tabBarLabel: () => null,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'chatbubble' : 'chatbubble-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'reader' : 'reader-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="global"
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'earth' : 'earth-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="newPost"
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'add-circle' : 'add-circle-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            (profile && profile.profilePicture) ? (
              <View style={{
                borderWidth: 1.5,
                borderColor: focused ? theme.colors.primary : theme.colors.surface,
                borderRadius: 100,
              }}>
                <Avatar.Image size={24} source={{ uri: profile.profilePicture }} />
              </View>

            ) : (
              <Avatar.Icon size={28} icon="account" style={{
                borderWidth: 1,
                backgroundColor: focused ? theme.colors.primary : theme.colors.surface,
              }} />
            )
          ),
        }}
      />

      <Tabs.Screen
        name="[user]"
        options={{
          href: null
        }}
      />
    </Tabs>
  );
}
