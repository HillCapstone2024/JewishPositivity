import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Image,
  StyleSheet,
  Text,
  LinearGradient,
  Settings,
  Alert,
  Keyboard,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as Storage from "../AsyncStorage.js";
import { createAvatar } from "@dicebear/core";
import { micah } from "@dicebear/collection";
import { SvgXml } from "react-native-svg";
import BottomTabNavigator from "./BottomTabNavigator.js";
import makeThemeStyle from '../Theme.js';

import UserProfile from "../screens/home/Profile.js";
import SettingsPage from "../screens/home/Settings.js";

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const [username, setUsername] = useState("");
  const theme = makeThemeStyle();

  const handleLogout = () => {
    const logout = async () => {
      await Storage.removeItem("@username");
      props.navigation.reset({
        index: 0,
        routes: [{ name: "Landing" }],
      });
      props.navigation.navigate("Landing");
    };
    Alert.alert("Logout?", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => logout() },
    ]);
  };

  useEffect(() => {
    const loadUsername = async () => {
      const storedUsername = await Storage.getItem("@username");
      setUsername(storedUsername || "No username");
    };

    loadUsername();
  }, []);

  const avatar = createAvatar(micah, {
    seed: username,
    radius: 50,
    mouth: ["smile", "smirk", "laughing"],
  }).toString();

  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{backgroundColor: '#4A90E2'}}>
        <ImageBackground
          source={require('../assets/images/profile_background.png')}
          style={{padding: 20}}>
        <SvgXml xml={avatar} style={styles.drawerImage} />
        <Text testID="usernameText" style={[styles.drawerUsername, theme["color"]]}>{username}</Text>
        </ImageBackground>
        <View style={{flex: 1, backgroundColor: '#fff', paddingTop: 10}}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      <View style={{padding: 20, borderTopWidth: 1, borderTopColor: '#ccc'}}>
        {/* <TouchableOpacity onPress={() => {}} style={{paddingVertical: 15}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="share-social-outline" size={22} />
            <Text style={styles.drawerText}> Share </Text>
          </View>
        </TouchableOpacity> */}

        <TouchableOpacity onPress={handleLogout} style={{paddingVertical: 15}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="exit-outline" size={22} />
            <Text style={styles.drawerText}> Logout </Text>
          </View>
        </TouchableOpacity>   
      </View>
    </View>
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
    <Drawer.Navigator initialRouteName="BottomTabNavigator"
      screenOptions={{
        drawerStyle: {
          width: "70%",
        },
        headerStyle: {
          backgroundColor: "#4A90E2",
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={BottomTabNavigator} options={{drawerIcon: ({color}) => (<Ionicons name="home" size={22} color={color} />),}}/>
      <Drawer.Screen name="UserProfile" component={UserProfile} testID="profileButton" options={{drawerIcon: ({color}) => (<Ionicons name="person" size={22} color={color} />),}}/>
      <Drawer.Screen name="Settings" component={SettingsPage} options={{drawerIcon: ({color}) => (<Ionicons name="settings" size={22} color={color} />),}}/>
      {/* <Drawer.Screen name="My Communities" component={CommunitiesPage} options={{drawerIcon: ({color}) => (<Ionicons name="people" size={22} color={color} />),}}/> */}
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerUsername: {
    color: '#fff',
    fontSize: 20,
    // fontFamily: 'Roboto-Medium',
    fontWeight: 600,
    marginBottom: 5,
  },
  drawerImage: {
    height: 80, 
    width: 80, 
    borderRadius: 40, 
    marginBottom: 10,
  },
  drawerText: {
    fontSize: 15,
    marginLeft: 5,
    // fontFamily: 'Roboto-Medium',
  },
});

export default MyDrawer;