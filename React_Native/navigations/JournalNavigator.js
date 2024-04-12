// AppNavigator.js

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabNavigator from "./BottomTabNavigator";
import JournalEntryDetailsScreen from "../screens/home/JournalEntryDetailsScreen";

const Stack = createNativeStackNavigator();

const JournalNavigator = () => {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={BottomTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="JournalEntryDetails"
          component={JournalEntryDetailsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default JournalNavigator;