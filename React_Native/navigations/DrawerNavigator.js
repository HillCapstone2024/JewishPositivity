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
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
const API_URL = "http://" + IP_ADDRESS + ":8000";
import IP_ADDRESS from "../ip.js";
import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as Storage from "../AsyncStorage.js";
import { createAvatar } from "@dicebear/core";
import { micah } from "@dicebear/collection";
import { SvgXml } from "react-native-svg";
import BottomTabNavigator from "./BottomTabNavigator.js";
import makeThemeStyle from "../tools/Theme.js";
import ParentProfile from "../screens/profile/ProfileParent.js";
import SettingsPage from "../screens/settings/Settings.js";
import AboutPage from "../screens/home/About.js";
import Communities from "../screens/communities/Communities.js";
import Badges from "../screens/home/Badges.js";
import Friends from "../screens/friends/FriendsList.js";
import FriendFeed from "../screens/friends/FriendFeed.js";
import FriendTab from "./FriendTab.js";
import FeedTab from "./FeedTab.js";
import * as Haptics from "expo-haptics";
import ImageViewer from "../tools/ImageViewer.js";
import FriendsParent from "../screens/friends/FriendsParent.js";
import { faUsersLine } from '@fortawesome/free-solid-svg-icons/faUsersLine';
import { faSynagogue } from '@fortawesome/free-solid-svg-icons/faSynagogue';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import ViewCommunity from "../screens/communities/ViewCommunity.js";

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const theme = makeThemeStyle();
  const [user, setUser] = useState();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert("Logout?", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => logout() },
    ]);
  };

  const logout = async () => {
    // await Storage.removeItem("@username");
    // await Storage.removeItem("@first_name");
    // await Storage.removeItem("@last_name");
    // await Storage.removeItem("@email");
    // await Storage.removeItem("@profilePicture");
    // await Storage.removeItem("@password");
    await Storage.clearAll();
    props.navigation.reset({
      index: 0,
      routes: [{ name: "Landing" }],
    });
    props.navigation.navigate("Landing");
  };


  const getUserInfo = async () => {
    console.log("get user info called");
    try {
      // const csrfToken = await getCsrfToken();
      const storedUsername = await Storage.getItem("@username");
      const storedProfilePicture = await Storage.getItem("@profilePicture");
      console.log("stored username: ", storedUsername);
      setProfilePicture(storedProfilePicture);
      setUsername(storedUsername || "No username");
    } catch (error) {
      console.log("error getting drawer user info", error);
    }
  };

  // This checks to see if your timezone changed and if it has, it will log you out so storage can be updated upon login
  const checkTimezone = async () => {
    console.log("checkTimezone called");
    const newtimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const storedtimezone = await Storage.getItem("@timezone");
    // const storedtimezone = "America/New_York";
    console.log("newtimezone:",newtimezone);
    console.log("storedtimezone:",storedtimezone);
    if (newtimezone != storedtimezone && storedtimezone != null)  {
      console.log("Handle logout");
      logout();
    }
  }

  useEffect(
    useCallback(() => {
    // const unsubscribe = navigation.addListener("drawerOpen", () => {
    // Call your method here
    
    getUserInfo();
    checkTimezone();
    // });

    // unsubscribe();
   }, [])
  );

  return (
    <View style={[{ flex: 1 }, theme["background"]]}>
      <DrawerContentScrollView {...props}>
        <ImageBackground
          source={require("../assets/images/profile_background.png")}
          style={{ padding: 20 }}
        >
          {/* <SvgXml xml={avatar} style={styles.drawerImage} /> */}
          <Image
            source={{ uri: `data:Image/jpeg;base64,${profilePicture}` }}
            style={styles.drawerImage}
          />
          <Text testID="usernameText" style={[styles.drawerUsername]}>
            {username}
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
            theme["hapticFeedback"] ? null : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
  // const navigation = useNavigation();
  const theme = makeThemeStyle();

  return (
    <Drawer.Navigator
      initialRouteName="BottomTabNavigator"
      screenOptions={{
        drawerStyle: {
          width: "70%",
        },
        drawerLabelStyle: theme["color"],
        // headerShown: false,
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Home"
        component={BottomTabNavigator}
        options={{
          drawerIcon: () => (
            <Ionicons name="home" size={22} color={theme["color"]["color"]} />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ParentProfile}
        testID="profileButton"
        options={{
          drawerIcon: () => (
            <Ionicons name="person" size={22} color={theme["color"]["color"]} />
          ),
        }}
      />
      {/* <Drawer.Screen
        name="Awards"
        component={Badges}
        options={{
          drawerIcon: () => (
            <Ionicons name="trophy" size={22} color={theme["color"]["color"]} />
          ),
        }}
      /> */}
      <Drawer.Screen
        name="Friends"
        component={FriendTab}
        options={{
          drawerIcon: () => (
            <Ionicons
              name="person-add"
              size={22}
              color={theme["color"]["color"]}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Communities"
        component={Communities}
        options={{
          drawerIcon: () => (
            // <Ionicons name="people" size={22} color={theme["color"]["color"]} />
            <FontAwesomeIcon
              icon={faSynagogue}
              // <FontAwesomeIcon icon={faUsersLine}
              size={28}
              color={"black"}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="About"
        component={AboutPage}
        options={{
          drawerIcon: () => (
            <Ionicons
              name="information-circle"
              size={22}
              color={theme["color"]["color"]}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsPage}
        options={{
          drawerIcon: () => (
            <Ionicons
              name="settings"
              size={22}
              color={theme["color"]["color"]}
            />
          ),
        }}
      />
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
