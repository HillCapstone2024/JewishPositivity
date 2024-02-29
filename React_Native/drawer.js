import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { View, Image, StyleSheet, Text, LinearGradient, Settings } from "react-native";

import Layout from "./Layout";
import Times from "./Times";
import UserProfile from "./Profile";
import SettingsPage from "./Settings";

const Drawer = createDrawerNavigator();


const CustomDrawerContent = (props) => {
  return (
    <DrawerContentScrollView {...props}>
      {/* <DrawerItemList {...props} /> */}
      <View style={styles.drawerHeader}>
        <Image
          source={require("./assets/logo.png")} //eventually have profile pic here. would need to do a post request
          style={styles.drawerImage}
        />
        <Text>Username here</Text> 
      </View>
      <DrawerItem
        label="layout"
        icon={({ color, size }) => (
          <Ionicons name="person" color={color} size={size} />
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
        label="My Community"
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
      />
    </DrawerContentScrollView>
  );
};


const MyDrawer = () => {
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
  drawerImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
});

export default MyDrawer;
