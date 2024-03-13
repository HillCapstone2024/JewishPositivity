import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { View, Image, StyleSheet, Text, LinearGradient, Settings, Alert, Keyboard } from "react-native";
import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import Layout from "./Layout";
import Times from "./Times";
import UserProfile from "./Profile";
import SettingsPage from "./Settings";
import * as Storage from "./AsyncStorage.js";
import { createAvatar } from '@dicebear/core';
import { micah } from '@dicebear/collection';
import { SvgXml } from 'react-native-svg';

const Drawer = createDrawerNavigator();


const CustomDrawerContent = (props) => {
  const [username, setUsername] = useState("");
  const avatar = createAvatar(micah, {
    seed: Storage.getItem("@username") || "No username",
    radius: 50,
    mouth: ["smile","smirk","laughing"]
  }).toString();


  const handleLogout = () => {
    const logout = async () => {
      await Storage.removeItem("@username");
      props.navigation.reset({
        index: 0,
        routes: [{ name: "Landing" }]
      });
      props.navigation.navigate('Landing')
    }
    Alert.alert(
      "Logout?",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: () => logout() }
      ]
    );
  };

  useEffect(() => {
    const loadUsername = async () => {
      const storedUsername = await Storage.getItem("@username");
      setUsername(storedUsername || "No username");
    };

    loadUsername();
  }, []);
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <SvgXml
          xml={avatar} 
          style={styles.drawerImage}
        />
        <Text style={styles.drawerUsername}>{username}</Text>
      </View>
      <DrawerItem
        label="Home"
        icon={({ color, size }) => (
          <Ionicons name="home" color={color} size={size} />
        )}
        inactiveBackgroundColor="white"
        component={Layout}
        onPress={() => props.navigation.navigate("Layout")}
      />
      <DrawerItem
        label="Profile"
        icon={({ color, size }) => (
          <Ionicons name="person" color={color} size={size} />
        )}
        inactiveBackgroundColor="white"
        component={UserProfile}
        onPress={() => props.navigation.navigate("UserProfile")}
      />
      <DrawerItem
        label="Settings"
        icon={({ color, size }) => (
          <Ionicons name="settings" color={color} size={size} />
        )}
        inactiveBackgroundColor="white"
        onPress={() => props.navigation.navigate("SettingsPage")}
      />
      <DrawerItem
        label="My Communities"
        icon={({ color, size }) => (
          <Ionicons name="people" color={color} size={size} />
        )}
        inactiveBackgroundColor="white"
      />
      <DrawerItem
        label="Logout"
        icon={({ color, size }) => (
          <Ionicons name="exit" color={color} size={size} />
        )}
        inactiveBackgroundColor="white"
        onPress={handleLogout}
      />
    </DrawerContentScrollView>
  );
};


const MyDrawer = ({ navigation }) => {
  //work in progress
    useFocusEffect(
      React.useCallback(() => {
        const unsubscribe = navigation.addListener("drawerOpen", () => {
          // Dismiss the keyboard when the drawer is opened
          Keyboard.dismiss();
        });

        return unsubscribe;
      }, [navigation])
    );
  return (
    <Drawer.Navigator
      initialRouteName="Layout"
      screenOptions={{
        drawerStyle: {
          backgroundColor: "#4A90E2",
          width: "70%",
        },
        headerStyle: {
          backgroundColor: "#4A90E2",
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Layout" component={Layout} />
      <Drawer.Screen name="UserProfile" component={UserProfile} />
      <Drawer.Screen name="SettingsPage" component={SettingsPage} />
      {/* <DrawerItemList/> */}
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerHeader: {
    alignItems: "center",
    paddingVertical: 20,
  },
  drawerUsername: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    paddingTop: 20,
  },
  drawerImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
});

export default MyDrawer;
