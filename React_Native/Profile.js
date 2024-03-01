import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TextInput, Button } from "react-native";
import BottomTab from "./BottomTab";

//temporary profile page
const UserProfile = () => {
  const [userInfo, setUserInfo] = useState({
    name: "John Doe",
    username: "@johndoe",
    dateJoined: "January 1, 2021",
    journalEntries: 120,
    profilePicture: "./assets/logo.png",
  });

  const [newPassword, setNewPassword] = useState("");

  const handleChangePassword = () => {
    // Implement password change logic here
    console.log("Password changed to:", newPassword);
    // Reset password field
    setNewPassword("");
  };

  return (
    <View style={styles.container}>
      <View>
        <Image
          source={require("./assets/logo.png")}
          style={styles.profilePic}
        />
        {/* <Button>Change Avatar</Button> */}
        <Text style={styles.info}>Name: {userInfo.name}</Text>
        <Text style={styles.info}>Username: {userInfo.username}</Text>
        <Text style={styles.info}>Date Joined: {userInfo.dateJoined}</Text>
        <Text style={styles.info}>
          Journal Entries: {userInfo.journalEntries}
        </Text>
      </View>
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
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: "80%",
  },
  content: {
    flex: 1,
    backgroundColor: "#4A90E2", // You can adjust the background color
  },
});

export default UserProfile;
