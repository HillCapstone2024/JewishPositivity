import React, { useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from './Login'
import Signup from './Signup'
import TimeChange from './Times';
import Landing from './Landing';

const Stack = createNativeStackNavigator();

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
        <Stack.Screen name="Times" component={TimeChange} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


