import "react-native-gesture-handler";
import React, { useState, useEffect } from "react";
import * as Storage from "./AsyncStorage.js";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppRegistry, Platform } from "react-native";

// import { LogLevel, OneSignal } from "react-native-onesignal";
// import Constants from "expo-constants";

import Login from "./screens/auth/Login.js";
import Signup from "./screens/auth/Signup.js";
import Times from "./screens/home/Times.js";
import Landing from "./screens/greet/Landing.js";
import LoadingScreen from "./screens/greet/Loading.js";
import TermsofUse from "./screens/home/TermsofUse.js";
import Layout from "./navigations/Layout.js";
import MyDrawer from "./navigations/drawer.js";
import HomeScreen from "./screens/home/HomeScreen.js";
import PrivacyPolicy from "./screens/home/PrivacyPolicy.js";

// OneSignal.Debug.setLogLevel(LogLevel.Verbose);
// OneSignal.initialize(Constants.expoConfig.extra.oneSignalAppId);

// OneSignal.Notifications.requestPermission(true);

const Stack = createNativeStackNavigator();
AppRegistry.registerComponent("X", () => App);


export default function App() {
  const [initialRouteName, setInitialRouteName] = useState("Drawer");
  const [isLoading, setIsLoading] = useState(true);

  const setRouteName = async () => {
    await Storage.getItem("@username").then((username) => {
      if (username) {
        setInitialRouteName("Drawer");
      }
    });
  };

  useEffect(() => {
    setRouteName();
    setTimeout(() => {
      setIsLoading(false);
    }, 4000);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName}>
        <Stack.Screen name="Landing" component={Landing} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Main" component={Layout} />
        <Stack.Screen name="Drawer" component={MyDrawer} />
        <Stack.Screen name="Times" component={Times} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="TermsofUse" component={TermsofUse} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
        {/* <Stack.Screen name="Times" component={Times} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="BottomTab" component={BottomTab} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
