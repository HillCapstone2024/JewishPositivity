import "react-native-gesture-handler";
import React, { useState, useEffect } from "react";
import * as Storage from "./AsyncStorage.js";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppRegistry, Platform } from "react-native";

//import { LogLevel, OneSignal } from "react-native-onesignal";
// import Constants from "expo-constants";

import AuthNavigator from "./navigations/AuthNavigator.js";

const Stack = createNativeStackNavigator();
AppRegistry.registerComponent("X", () => App);

const linking = {
  prefixes: ["https://jewishpositivity.com", "jewishpositivity://"],
  config: {
    screens: {
      CheckIn: {
        path: "CheckIn/:checkInType",
        parse: {
          momentType: (checkInType) => `CheckIn-${checkInType}`,
        },
        stringify: {
          momentType: (checkInType) => checkInType.replace(/^CheckIn-/, ""),
        },
      },
    },
  },
};

export default function App() {
  //OneSignal.Debug.setLogLevel(LogLevel.Verbose);
  //OneSignal.initialize(Constants.expoConfig.extra.oneSignalAppId);
  //OneSignal.Notifications.requestPermission(true);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer linking={linking}>
        <AuthNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
