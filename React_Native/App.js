import "react-native-gesture-handler";
import React, { useState, useEffect } from "react";
import * as Storage from "./AsyncStorage.js";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppRegistry, Platform } from "react-native";

// import { LogLevel, OneSignal } from "react-native-onesignal";
// import Constants from "expo-constants";

import AuthNavigator from "./navigations/AuthNavigator.js";

// OneSignal.Debug.setLogLevel(LogLevel.Verbose);
// OneSignal.initialize(Constants.expoConfig.extra.oneSignalAppId);

// OneSignal.Notifications.requestPermission(true);

const Stack = createNativeStackNavigator();
AppRegistry.registerComponent("X", () => App);

export default function App() {
  return (
    <NavigationContainer>
        <AuthNavigator />
    </NavigationContainer>
  );
}