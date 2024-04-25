import "react-native-gesture-handler";
import React, { useState, useEffect } from "react";
import * as Storage from "../AsyncStorage.js";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// import { LogLevel, OneSignal } from "react-native-onesignal";
// import Constants from "expo-constants";

import Login from "../screens/auth/Login.js";
import Signup from "../screens/auth/Signup.js";
import ForgotPassword from "../screens/auth/ForgotPassword.js";
import LoadingScreen from "../screens/greet/Loading.js";
import MyDrawer from "./DrawerNavigator.js";
import Landing from "../screens/greet/Landing.js";
import TermsofUse from '../screens/home/TermsofUse';
import CheckInEntryDetailsScreen from "../screens/home/CheckInEntryDetailsScreen.js";
import CheckIn from "../screens/home/CheckIn.js";
import Community from "../screens/home/Community.js";
import ViewCommunity from "../screens/home/ViewCommunity.js";
import ViewOwnedCommunity from "../screens/home/ViewOwnedCommunity.js";

// OneSignal.Debug.setLogLevel(LogLevel.Verbose);
// OneSignal.initialize(Constants.expoConfig.extra.oneSignalAppId);

// OneSignal.Notifications.requestPermission(true);

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const [initialRouteName, setInitialRouteName] = useState("Landing");
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
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerTintColor: "#FFFFFF",
        headerBackTitleVisible: false,
        headerStyle: {
          backgroundColor: "#4A90E2",
        },
      }}
    >
      <Stack.Screen
        name="Landing"
        component={Landing}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen
        name="Signup"
        component={Signup}
        options={{ headerTitle: "Sign up" }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPassword}
        options={{ headerTitle: "Forgot Password?" }}
      />
      <Stack.Screen
        name="Drawer"
        component={MyDrawer}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Terms of Use" component={TermsofUse} />
      <Stack.Screen
        name="CheckIn"
        component={CheckIn}
        options={{ headerTitle: "Check-in" }}
      />
      <Stack.Screen
        name="CheckInEntryDetails"
        component={CheckInEntryDetailsScreen}
        options={{ headerTitle: "Check-in Details" }}
      />
      <Stack.Screen
        name="Community"
        component={Community}
        options={{ headerTitle: "Community" }}
      />
      <Stack.Screen
        name="ViewCommunity"
        component={ViewCommunity}
        options={{ headerTitle: "Community" }}
      />
      <Stack.Screen
        name="ViewOwnedCommunity"
        component={ViewOwnedCommunity}
        options={{ headerTitle: "Community" }}
      />
    </Stack.Navigator>
  );
}
