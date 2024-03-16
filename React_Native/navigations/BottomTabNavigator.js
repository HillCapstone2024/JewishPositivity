import React from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/home/HomeScreen';
import JournalEntry from "../screens/home/journalEntry";

const Tab = createBottomTabNavigator();

const screenOptions = {
  "headerShown": false,
  "tabBarActiveBackgroundColor": "#4A90E2",
  "tabBarInactiveBackgroundColor": "#4A90E2",
  "tabBarActiveTintColor": "black",
  "tabBarInactiveTintColor": "white",
  "tabBarLabelStyle": {
    "paddingBottom": 5,
    "fontSize": 10
  },
  "tabBarStyle": [{
    "display": "flex"
  }, null],
  "tabBarShowLabel": true,
  "tabBarStyle": { backgroundColor: "#4A90E2" },
};

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator initialRouteName="Home" screenOptions={screenOptions}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Journal"
        component={JournalEntry}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="journal" size={size} color={color} />
          ),
        }}
      />

    </Tab.Navigator>
  );
};

export default BottomTabNavigator;