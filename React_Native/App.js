import React, { useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppRegistry, Platform } from "react-native";

// import { LogLevel, OneSignal } from "react-native-onesignal";
// import Constants from "expo-constants";

import Login from './Login'
import Signup from './Signup'
import Times from './Times';
import Landing from './Landing';

// OneSignal.Debug.setLogLevel(LogLevel.Verbose);
// OneSignal.initialize(Constants.expoConfig.extra.OneSignalAppId);

// OneSignal.Notifications.requestPermission(true);

const Stack = createNativeStackNavigator();
AppRegistry.registerComponent("X", () => App);

export default function App() {
  const [initialRouteName, setInitialRouteName] = useState("Login");

  // const value = AsyncStorage.getItem('user');
  // if (value !== null) {
  //   setInitialRouteName("Home");
  // }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName}>
        <Stack.Screen name="Landing" component={Landing} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Times" component={Times} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


