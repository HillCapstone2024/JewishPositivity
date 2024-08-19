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

// OneSignal.Debug.setLogLevel(LogLevel.Verbose);
// OneSignal.initialize(Constants.expoConfig.extra.oneSignalAppId);
// OneSignal.Notifications.requestPermission(true);

const Stack = createNativeStackNavigator();
AppRegistry.registerComponent("X", () => App);

const linking = {
  prefixes: ["https://jewishpositivity.com", "jewishpositivity://"],
  config: {
    screens: {
      CheckIn: {
        path: "checkin/:username/:moment_number",
        parse: {
          username: (username) => `${username}`,
          moment_number: (moment_number) => `Number(moment_number)`,
        },
        stringify: {
          username: (username) => username,
          moment_number: (moment_number) => moment_number,
        },
      },
    },
  },
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer linking={linking}>
      {isAuthenticated ? (
        <Stack.Navigator>
          {/* <Stack.Screen name="AuthNavigator" component={AuthNavigator} /> */}
          <Stack.Screen name="CheckIn" component={CheckInScreen} />
        </Stack.Navigator>
        ) : (
          <AuthNavigator />
        )}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
