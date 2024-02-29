import "react-native-gesture-handler";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppRegistry, Platform } from "react-native";
import { View, Text } from "react-native";

// import { LogLevel, OneSignal } from "react-native-onesignal";
// import Constants from "expo-constants";

import Login from "./Login";
import Signup from "./Signup";
import Times from "./Times";
import Landing from "./Landing";
import BottomTab from "./BottomTab";
import LoadingScreen from "./Loading";
import TermsofUse from "./TermsofUse";
import Layout from "./Layout";
import MyDrawer from "./drawer";
import HomeScreen from "./HomeScreen";

// OneSignal.Debug.setLogLevel(LogLevel.Verbose);
// OneSignal.initialize(Constants.expoConfig.extra.oneSignalAppId);

// OneSignal.Notifications.requestPermission(true);

const Stack = createNativeStackNavigator();
AppRegistry.registerComponent("X", () => App);


export default function App() {
  const [initialRouteName, setInitialRouteName] = useState("Login");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 4000);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }
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
        <Stack.Screen name="Main" component={Layout} />
        <Stack.Screen name="Drawer" component={MyDrawer}/>
        <Stack.Screen name="Times" component={Times} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="TermsofUse" component={TermsofUse} />
        
        {/* <Stack.Screen name="Times" component={Times} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="BottomTab" component={BottomTab} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
