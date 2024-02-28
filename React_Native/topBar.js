import React from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";

const TopBar = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          style={styles.button}
        >
          <Image source={require("./assets/user.png")} style={styles.icon} />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image source={require("./assets/logo.png")} style={styles.logo} />
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("Settings")}
          style={styles.button}
        >
          <Image source={require("./assets/setting.png")} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between", // Ensures items are spaced out to each end and center
    alignItems: "center", // Align items vertically
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#4A90E2",
    // marginBottom: 50,
    // marginTop: 50,
  },
  button: {
    // Adjust padding if needed
  },
  icon: {
    width: 24,
    height: 24,
  },
  logoContainer: {
    // This can be adjusted based on how you want the logo to appear
  },
  logo: {
    width: 100, // Adjust based on your logo size
    height: 40, // Adjust based on your logo size
    resizeMode: "contain", // This ensures the logo scales nicely
  },
});

export default TopBar;
