import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  StyleSheet,
  Text,
  Alert,
  Keyboard,
  ImageBackground,
  TouchableOpacity,
  Image
} from "react-native";
import axios from "axios";
const API_URL = "http://" + IP_ADDRESS + ":8000";
import IP_ADDRESS from "../ip.js";
import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as Storage from "../AsyncStorage.js";
import { createAvatar } from "@dicebear/core";
import { micah } from "@dicebear/collection";
import { SvgXml } from "react-native-svg";
import BottomTabNavigator from "./BottomTabNavigator.js";
import makeThemeStyle from '../tools/Theme.js';
import ParentProfile from "../screens/home/ProfileParent.js";
import SettingsPage from "../screens/home/Settings.js";
import Communities from "../screens/home/Communities.js";
import Badges from "../screens/home/Badges.js";
import Friends from "../screens/home/Friends.js";
import FriendFeed from "../screens/home/FriendFeed.js";
import * as Haptics from 'expo-haptics';
import ImageViewer from "../tools/ImageViewer.js";

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const [username, setUsername] = useState("");
  const theme = makeThemeStyle();
  const [user, setUser] = useState();

  const handleLogout = () => {
    const logout = async () => {
      await Storage.removeItem("@username");
      await Storage.removeItem("@first_name");
      await Storage.removeItem("@last_name");
      await Storage.removeItem("@email");
      await Storage.removeItem("@profilePicture");
      await Storage.removeItem("@password");
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
    getUserInfo();
  }, []);

  // useFocusEffect(() => {
  //   const getUser = async () => {
  //     getUserInfo;
  //   };
  //   getUser();
  //   getUserInfo();
  // }
  // );

  const getCsrfToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/csrf-token/`);
      return response.data.csrfToken;
    } catch (error) {
      console.error("Error retrieving CSRF token:", error);
      throw new Error("CSRF token retrieval failed");
    }
  };

  const getUserInfo = async () => {
    try {
      const csrfToken = await getCsrfToken();
      const storedUsername = await Storage.getItem("@username");
      console.log('stored username: ', storedUsername)
      setUsername(storedUsername || "No username");
      const response = await axios.get(`${API_URL}/get_user_info/`, {
        params: {
          username: storedUsername,
        },
        headers: {
          "X-CSRFToken": csrfToken,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setUser(response.data);
      console.log('profile pic: ',response.data.profilepicture);
    } catch (error) {
      console.log('error getting drawer user info', error);
    }
  };

  const avatar = createAvatar(micah, {
    seed: username,
    radius: 50,
    mouth: ["smile", "smirk", "laughing"],
  }).toString();

  return (
    <View style={[{ flex: 1 }, theme["background"]]}>
      <DrawerContentScrollView {...props}>
        <ImageBackground
          source={require("../assets/images/profile_background.png")}
          style={{ padding: 20 }}
        >
          {/* <SvgXml xml={avatar} style={styles.drawerImage} /> */}
          <Image
            source={{ uri: `data:Image/jpeg;base64,${user?.profilepicture}` }}
            style={styles.drawerImage}
          />
          <Text testID="usernameText" style={[styles.drawerUsername]}>
            {user?.username}
          </Text>
        </ImageBackground>
        <View
          style={[
            { flex: 1, backgroundColor: "#fff", paddingTop: 10 },
            theme["background"],
          ]}
        >
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      <View
        style={[{ padding: 20, borderTopWidth: 1, borderTopColor: "#ccc" }]}
      >
        {/* <TouchableOpacity onPress={() => {}} style={{paddingVertical: 15}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="share-social-outline" size={22} />
            <Text style={styles.drawerText}> Share </Text>
          </View>
        </TouchableOpacity> */}

        <TouchableOpacity
          onPress={() => {
            handleLogout();
            theme["hapticFeedback"] ? null : Haptics.selectionAsync();
          }}
          style={{ paddingVertical: 15 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="exit-outline"
              color={theme["color"]["color"]}
              size={22}
            />
            <Text style={[styles.drawerText, theme["color"]]}> Logout </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const MyDrawer = ({ navigation }) => {
  //work in progress
  // useFocusEffect(
  //   React.useCallback(() => {
  //     const unsubscribe = navigation.addListener("drawerOpen", () => {
  //       // Dismiss the keyboard when the drawer is opened
  //       Keyboard.dismiss();
  //     });

  //     return unsubscribe;
  //   }, [navigation])
  // );
  return (
    <Drawer.Navigator initialRouteName="BottomTabNavigator"
      screenOptions={{
        drawerStyle: {
          width: "70%",
        },
        drawerLabelStyle: 
          theme['color']
        
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={BottomTabNavigator} options={{ drawerIcon: () => (<Ionicons name="home" size={22} color={theme['color']['color']} />), }} />
      <Drawer.Screen name="Profile" component={ParentProfile} testID="profileButton" options={{ drawerIcon: () => (<Ionicons name="person" size={22} color={theme['color']['color']} />), }} />
      <Drawer.Screen name="Badges" component={Badges} options={{ drawerIcon: () => (<Ionicons name="trophy" size={22} color={theme['color']['color']} />), }} />
      <Drawer.Screen name="Friends" component={Friends} options={{ drawerIcon: () => (<Ionicons name="person-add" size={22} color={theme['color']['color']} />), }} />
      <Drawer.Screen name="Communities" component={Communities} options={{drawerIcon: () => (<Ionicons name="people" size={22} color={theme['color']['color']} />),}}/>
      <Drawer.Screen name="Settings" component={SettingsPage} options={{ drawerIcon: () => (<Ionicons name="settings" size={22} color={theme['color']['color']} />), }} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerUsername: {
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