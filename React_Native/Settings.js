import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TextInput, Button } from "react-native";
import BottomTab from "./BottomTab";


const SettingsPage = () => {
  return (
    <View style={styles.container}>
      <Text>Here is where settings page will go</Text>
      <View style={styles.content}>
        <BottomTab />
      </View>
      {/* getting bottom tap to display is a work in progress */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    flex: 1,
    backgroundColor: "#fff", // You can adjust the background color
  },
});

export default SettingsPage;
