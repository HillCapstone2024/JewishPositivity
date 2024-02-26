import React, { useState } from "react";
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import TimeChange from './Times';
import HomeScreen from './HomeScreen';

const Tab = createBottomTabNavigator();

const screenOptions = {
    "tabBarActiveTintColor": "blue",
    "tabBarInactiveTintColor": "grey",
    "tabBarLabelStyle": {
    "paddingBottom": 5,
    "fontSize": 10
    },
    "tabBarStyle": [{
    "display": "flex"
    },null]
};

const BottomTab = () => {
  return (
    <Tab.Navigator initialRouteName="Home" screenOptions={screenOptions}>

        <Tab.Screen name="Home" component={HomeScreen} options={{tabBarIcon:({color, size})=>(
            <Ionicons name="home-outline" size={size} color={color} />)
          }}/>

        <Tab.Screen name="Times" component={TimeChange} options={{tabBarIcon:({color, size})=>(
            <Ionicons name="time-outline" size={size} color={color} />)
          }}/>
          
    </Tab.Navigator>
  );
};

export default BottomTab;