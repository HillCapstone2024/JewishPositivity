import React from "react";
import { View, StyleSheet } from "react-native";
import BottomTab from "./BottomTab";
import TopBar from "./topBar";

const Layout = () => {
  return (
    <View style={styles.container}>
      {/* <TopBar /> */}
      <View style={styles.content}>
        <BottomTab />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: "#fff", // You can adjust the background color
  },
});

export default Layout;
